// backend/models/Chat.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chatId: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    mode: { type: String, default: "document" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", chatSchema);