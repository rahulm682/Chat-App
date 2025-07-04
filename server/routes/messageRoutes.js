const express = require("express");
const { sendMessage, getMessages, uploadFile } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", protect, sendMessage);                             // Send a message
router.get("/:chatId", protect, getMessages);                       // Get all messages for a chat
router.post("/upload", protect, upload.single("file"), uploadFile); // to handle the file upload

module.exports = router;
