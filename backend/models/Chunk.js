// backend/models/Chunk.js
const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    text: { type: String, required: true },
    // Storing the vector embedding directly in MongoDB Document
    embedding: { type: [Number], required: true } 
});

module.exports = mongoose.model("Chunk", chunkSchema);