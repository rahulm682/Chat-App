const express = require("express");
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup, getChats, debugUnreadCount, testUnreadCount } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, accessChat);             // Access or create 1:1 chat
router.get("/", protect, getChats);              // Get all chats for user
router.post("/group", protect, createGroupChat);   // Create group chat
router.put("/rename", protect, renameGroup);       // Rename group chat
router.put("/groupadd", protect, addToGroup);      // Add to group
router.put("/groupremove", protect, removeFromGroup); // Remove from group
router.get("/debug/:chatId", protect, debugUnreadCount); // Debug unread count
router.get("/test", protect, testUnreadCount); // Test unread count logic

module.exports = router;
