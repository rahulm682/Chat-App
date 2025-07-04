import Reaction from "../models/Reaction.js";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// @route   POST /api/reactions
// @desc    Add or update reaction to a message
const addReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    const userId = req.user._id;

    // Check if message exists
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is part of the chat
    const chat = await Chat.findById(message.chat);
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to react to this message" });
    }

    // Try to add reaction, if it exists, update it
    const reaction = await Reaction.findOneAndUpdate(
      { message: messageId, user: userId },
      { emoji },
      { upsert: true, new: true }
    ).populate("user", "name");

    // Emit socket event for real-time updates
    const io = req.app.get("io");
    io.to(message.chat.toString()).emit("reaction-added", {
      messageId,
      reaction,
    });

    res.json(reaction);
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   DELETE /api/reactions/:messageId
// @desc    Remove reaction from a message
const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Check if message exists
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Remove reaction
    const deletedReaction = await Reaction.findOneAndDelete({
      message: messageId,
      user: userId,
    });

    if (!deletedReaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    // Emit socket event for real-time updates
    const io = req.app.get("io");
    io.to(message.chat.toString()).emit("reaction-removed", {
      messageId,
      userId,
    });

    res.json({ message: "Reaction removed" });
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @route   GET /api/reactions/:messageId
// @desc    Get all reactions for a message
const getReactions = async (req, res) => {
  try {
    const { messageId } = req.params;

    const reactions = await Reaction.find({ message: messageId })
      .populate("user", "name")
      .sort({ createdAt: 1 });

    res.json(reactions);
  } catch (error) {
    console.error("Error getting reactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { addReaction, removeReaction, getReactions }; 