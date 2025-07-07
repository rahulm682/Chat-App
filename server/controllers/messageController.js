const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");
const Reaction = require("../models/Reaction");
const cloudinary = require("../config/cloudinary");

// Send message
const sendMessage = async (req, res) => {
  const { content, chatId, type = "text" } = req.body;

  if (!content || !chatId) {
    return res
      .status(400)
      .json({ message: "Content and Chat ID are required" });
  }

  try {
    console.log(`Creating message in chat ${chatId} by user ${req.user._id}`);
    
    let newMessage = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
      type,
      readBy: [req.user._id], // Mark as read by sender immediately
    });

    console.log(`Message created with readBy:`, newMessage.readBy);

    newMessage = await newMessage.populate("sender", "name avatarUrl");
    newMessage = await newMessage.populate({
      path: "chat",
      populate: { path: "participants", select: "name avatarUrl email" },
    });

    // Add empty reactions array to new message
    const messageObj = newMessage.toObject();
    messageObj.reactions = [];
    newMessage = messageObj;

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id,
      updatedAt: new Date(),
    });

    // Get io instance
    const io = req.app.get("io");

    // Auto-mark message as read for users who are actively viewing this chat
    const { autoMarkMessagesAsRead } = require("../socket").default;
    await autoMarkMessagesAsRead(chatId, newMessage._id);

    // Emit to all participants' personal rooms
    // This ensures each user receives the message exactly once
    const chat = await Chat.findById(chatId).populate("participants");
    if (chat) {
      console.log(`Emitting message to participants:`, chat.participants.map(p => p._id));
      chat.participants.forEach((participant) => {
        io.to(participant._id.toString()).emit("message-received", newMessage);
      });
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get messages for a chat (without pagination)
const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;

  console.log(`Getting messages for chat ${chatId}, page ${page}, limit ${limit}`);

  try {
    // Count total messages for this chat
    const total = await Message.countDocuments({ chat: chatId });
    console.log(`Total messages in chat: ${total}`);

    // For chat applications, we want to show latest messages first
    // Page 1: Latest messages (newest at bottom)
    // Page 2+: Older messages (when scrolling up)
    const skip = (page - 1) * limit;
    console.log(`Skip: ${skip}, will fetch ${limit} messages`);

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name avatarUrl email")
      .sort({ createdAt: -1 }) // Descending order (newest first)
      .skip(skip)
      .limit(limit);

    console.log(`Found ${messages.length} messages, first message createdAt:`, messages[0]?.createdAt);
    console.log(`Last message createdAt:`, messages[messages.length - 1]?.createdAt);

    // Get reactions for all messages
    const messageIds = messages.map((msg) => msg._id);
    const reactions = await Reaction.find({
      message: { $in: messageIds },
    }).populate("user", "name avatarUrl");

    // Group reactions by message ID
    const reactionsByMessage = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.message.toString()]) {
        acc[reaction.message.toString()] = [];
      }
      acc[reaction.message.toString()].push(reaction);
      return acc;
    }, {});

    // Add reactions to messages
    const messagesWithReactions = messages.map((message) => {
      const messageObj = message.toObject();
      messageObj.reactions = reactionsByMessage[message._id.toString()] || [];
      return messageObj;
    });

    // Reverse the messages so newest appear at the bottom (chronological order for UI)
    const orderedMessages = messagesWithReactions.reverse();
    const hasMore = skip + limit < total;
    
    console.log(`Returning ${orderedMessages.length} messages, hasMore: ${hasMore}`);
    console.log(`First message in response createdAt:`, orderedMessages[0]?.createdAt);
    console.log(`Last message in response createdAt:`, orderedMessages[orderedMessages.length - 1]?.createdAt);
    
    res.status(200).json({
      messages: orderedMessages,
      hasMore,
      page,
      total,
    });
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Cloudinary upload stream wrapper
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Upload file to Cloudinary
const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const result = await streamUpload(req.file.buffer);
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};

// Mark all messages in a chat as read by a user
const markMessagesAsRead = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.user._id;
  
  console.log(`Marking messages as read for chat ${chatId} by user ${userId}`);
  
  try {
    // Get all messages in the chat that are not read by this user
    const unreadMessages = await Message.find({ 
      chat: chatId 
    }).select('readBy');
    
    const messagesToUpdate = unreadMessages.filter(message => 
      !message.readBy || !message.readBy.includes(userId)
    );
    
    console.log(`Found ${messagesToUpdate.length} unread messages out of ${unreadMessages.length} total messages`);
    
    // Update all unread messages
    if (messagesToUpdate.length > 0) {
      const messageIds = messagesToUpdate.map(msg => msg._id);
      const result = await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { readBy: userId } }
      );
      
      console.log(`Updated ${result.modifiedCount} messages as read`);
    }
    
    res.status(200).json({ success: true, modifiedCount: messagesToUpdate.length });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  uploadFile,
  markMessagesAsRead,
};
