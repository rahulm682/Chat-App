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

    console.log("req.body", req.body);
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

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
