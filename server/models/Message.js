const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    type: { type: String, enum: ["text", "image"], default: "text" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
