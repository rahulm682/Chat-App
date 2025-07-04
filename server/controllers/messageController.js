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
    let newMessage = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
      type,
    });

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

    // Emit to all participants' personal rooms
    // This ensures each user receives the message exactly once
    const chat = await Chat.findById(chatId).populate("participants");
    if (chat) {
      chat.participants.forEach((participant) => {
        io.to(participant._id.toString()).emit("message-received", newMessage);
      });
    }

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get messages for a chat (without pagination)
const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;

  try {
    // Count total messages for this chat
    const total = await Message.countDocuments({ chat: chatId });

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name avatarUrl email")
      .sort({ createdAt: -1 }) // Descending order (newest first)
      .skip((page - 1) * limit)
      .limit(limit);

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

    const orderedMessages = messagesWithReactions.reverse(); // Oldest first for UI
    const hasMore = page * limit < total;
    res.status(200).json({
      messages: orderedMessages,
      hasMore,
      page,
      total,
    });
  } catch (err) {
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

module.exports = {
  sendMessage,
  getMessages,
  uploadFile,
};
