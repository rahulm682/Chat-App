const express = require("express");
const { addReaction, removeReaction, getReactions } = require("../controllers/reactionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addReaction);
router.delete("/:messageId", protect, removeReaction);
router.get("/:messageId", protect, getReactions);

module.exports = router; 