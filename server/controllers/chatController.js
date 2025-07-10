// controllers/chatController.js
const Chat = require("../models/Chat");
const User = require("../models/User");

// Access or create 1:1 chat
const accessChat = async (req, res) => {
  const { userId } = req.body; // userId to chat with
  if (!userId) return res.status(400).send("UserId param not sent with request");

  let chat = await Chat.findOne({
    isGroup: false,
    participants: { $all: [req.user._id, userId] },
  })
    .populate("participants", "-passwordHash")
    .populate("latestMessage");

  if (chat) {
    return res.json(chat);
  }
  // Create new chat if none exists
  const newChat = new Chat({
    isGroup: false,
    participants: [req.user._id, userId],
  });

  const createdChat = await newChat.save();
  const fullChat = await Chat.findById(createdChat._id).populate("participants", "-passwordHash");
  res.status(201).json(fullChat);
};

// Fetch all chats for logged in user
const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: { $elemMatch: { $eq: req.user._id } } })
      .populate("participants", "-passwordHash")
      .populate("groupAdmin", "-passwordHash")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name email" },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Create group chat
const createGroupChat = async (req, res) => {
  const { name, users } = req.body; // users is array of userIds (excluding self)

  if (!name || !users) {
    return res.status(400).send("Please provide name and users");
  }

  if (users.length < 2) {
    return res.status(400).send("More than 2 users are required to form a group chat");
  }

  users.push(req.user._id);

  const groupChat = new Chat({
    chatName: name,
    participants: users,
    isGroup: true,
    groupAdmin: req.user._id,
  });

  const savedGroupChat = await groupChat.save();
  const fullGroupChat = await Chat.findById(savedGroupChat._id).populate("participants", "-passwordHash").populate("groupAdmin", "-passwordHash");
  res.status(201).json(fullGroupChat);
};

// Rename group chat
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
    .populate("participants", "-passwordHash")
    .populate("groupAdmin", "-passwordHash");

  if (!updatedChat) return res.status(404).send("Chat not found");
  res.json(updatedChat);
};

// Add user to group chat
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { participants: userId } },
    { new: true }
  )
    .populate("participants", "-passwordHash")
    .populate("groupAdmin", "-passwordHash");

  if (!added) return res.status(404).send("Chat not found");
  res.json(added);
};

// Remove user from group chat
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { participants: userId } },
    { new: true }
  )
    .populate("participants", "-passwordHash")
    .populate("groupAdmin", "-passwordHash");

  if (!removed) return res.status(404).send("Chat not found");
  res.json(removed);
};

// Get all chats for the user, including unread count for each chat
const getChats = async (req, res) => {
  const userId = req.user._id;
  try {
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name avatarUrl email")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "name avatarUrl email" },
      })
      .sort({ updatedAt: -1 });

    // For each chat, count unread messages for the user
    const chatIds = chats.map(chat => chat._id);
    const Message = require('../models/Message');
    
    // Use a simpler approach: get all messages and filter in JavaScript
    const allMessages = await Message.find({ chat: { $in: chatIds } }).select('chat readBy');
    
    // Group messages by chat and count unread ones
    const unreadCountMap = {};
    chatIds.forEach(chatId => {
      unreadCountMap[chatId.toString()] = 0;
    });
    
    allMessages.forEach(message => {
      const chatId = message.chat.toString();
      const isRead = message.readBy && message.readBy.includes(userId);
      if (!isRead) {
        unreadCountMap[chatId] = (unreadCountMap[chatId] || 0) + 1;
      }
    });

    // Attach unreadCount to each chat
    const chatsWithUnread = chats.map(chat => {
      const unreadCount = unreadCountMap[chat._id.toString()] || 0;
      return {
        ...chat.toObject(),
        unreadCount
      };
    });

    res.json(chatsWithUnread);
  } catch (err) {
    console.error('Error in getChats:', err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// Debug endpoint to check unread counts
const debugUnreadCount = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  
  try {
    const Message = require('../models/Message');
    
    // Get all messages in the chat
    const allMessages = await Message.find({ chat: chatId }).select('sender readBy');
    
    // Count unread messages using the same logic as getChats
    const unreadMessages = allMessages.filter(message => 
      !message.readBy || !message.readBy.includes(userId)
    );
    
    const unreadCount = unreadMessages.length;
    
    res.json({
      chatId,
      userId,
      totalMessages: allMessages.length,
      unreadCount,
      messages: allMessages,
      unreadMessages: unreadMessages
    });
  } catch (err) {
    console.error('Error in debugUnreadCount:', err);
    res.status(500).json({ message: "Failed to debug unread count" });
  }
};

// Test endpoint to verify unread count logic
const testUnreadCount = async (req, res) => {
  const userId = req.user._id;
  
  try {
    const Message = require('../models/Message');
    
    // Get a sample message to test the logic
    const sampleMessage = await Message.findOne().select('readBy');
    
    // Test the includes logic
    const isRead = sampleMessage?.readBy && sampleMessage.readBy.includes(userId);
    
    // Test with a non-existent user ID
    const fakeUserId = '507f1f77bcf86cd799439011';
    const isReadByFakeUser = sampleMessage?.readBy && sampleMessage.readBy.includes(fakeUserId);
    
    res.json({
      userId,
      sampleMessage: sampleMessage ? {
        id: sampleMessage._id,
        readBy: sampleMessage.readBy,
        isReadByCurrentUser: isRead,
        isReadByFakeUser: isReadByFakeUser
      } : null
    });
  } catch (err) {
    console.error('Error in testUnreadCount:', err);
    res.status(500).json({ message: "Failed to test unread count" });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  getChats,
  debugUnreadCount,
  testUnreadCount,
};
