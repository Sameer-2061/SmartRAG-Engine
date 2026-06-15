require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const crypto = require("crypto");

// PDF Parse FIX: Defensive import logic
const pdfParseLib = require("pdf-parse");
const pdf = (typeof pdfParseLib === 'function') ? pdfParseLib : (pdfParseLib.default || pdfParseLib.pdf);

const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { cosineSimilarity } = require("./utils/mathUtils");
const Chunk = require("./models/Chunk");
const Chat = require("./models/Chat");

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "put_a_long_random_secret_here";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// FASTEST MODELS WITH FALLBACK: Using your exact new API Key list
async function getGeminiResponse(prompt) {
    const modelsToTry = [
        'gemini-3.5-flash',       // Priority 1: Newest and fastest Flash
        'gemini-3.1-flash-lite',  // Priority 2: Ultra-low latency Lite model
        'gemini-2.5-flash',       // Priority 3: Stable high-performance Flash
        'gemini-2.0-flash-lite'   // Priority 4: Ultimate fallback
    ];
    let lastError = "";
    
    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (e) {
            console.warn(`[Fallback Warning] Model ${modelName} failed. Trying next...`);
            lastError = e.message;
        }
    }
    throw new Error(`All Gemini fallbacks failed. Exact Error: ${lastError}`);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const User = mongoose.model("User", new mongoose.Schema({ email: { type: String, unique: true }, password: String }));

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { return res.status(401).json({ error: "Invalid token" }); }
}

async function extractText(buffer, mimetype) {
    try {
        if (mimetype === "application/pdf") {
            const data = await pdf(buffer);
            return data.text;
        } else if (mimetype.includes("wordprocessingml") || mimetype.includes("msword")) {
            const data = await mammoth.extractRawText({ buffer: buffer });
            return data.value;
        } else if (mimetype === "text/plain") {
            return buffer.toString("utf-8");
        }
        throw new Error("Unsupported format");
    } catch (e) { throw new Error("Text extraction failed: " + e.message); }
}

// OPTIMIZATION: Large chunks to minimize API hits
function chunkText(text, chunkSize = 1500, overlap = 200) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        chunks.push(words.slice(i, i + chunkSize).join(" "));
    }
    return chunks.filter(c => c.trim().length > 0);
}

// Routes
app.post("/api/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword });
        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.json({ token });
    } catch (e) { res.status(400).json({ error: "Signup failed." }); }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Wrong password" });
        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.json({ token });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/new-chat", auth, (req, res) => {
    const chat_id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    res.json({ chat_id });
});

app.post("/api/upload", auth, multer().single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const text = await extractText(file.buffer, file.mimetype);
    const chunks = chunkText(text);

    // Using the best embedding model from the list
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const documentsToInsert = [];
    
    // FAST UPLOAD: Batching database insertion
    for (const chunk of chunks) {
        const result = await embeddingModel.embedContent(chunk);
        documentsToInsert.push({ 
            userId: req.user.id, 
            filename: file.originalname, 
            text: chunk, 
            embedding: result.embedding.values 
        });
    }
    
    if (documentsToInsert.length > 0) {
        await Chunk.insertMany(documentsToInsert);
    }
    
    res.json({ message: "Indexed successfully", chunks: chunks.length });
  } catch (e) { 
    console.error("UPLOAD ERROR:", e);
    res.status(500).json({ error: e.message }); 
  }
});

app.post("/api/ask", auth, async (req, res) => {
  try {
    // TOKEN LIMIT FIX: top_k reduced to 2 to prevent "Payload Too Large / Rate Limit" errors
    const { chat_id, question, mode, top_k = 2 } = req.body;
    let finalAnswer = "";

    if (mode === "global") {
        finalAnswer = await getGeminiResponse(question);
    } else {
        const userChunks = await Chunk.find({ userId: req.user.id });
        if (userChunks.length > 0) {
            const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
            const qResult = await embeddingModel.embedContent(question);
            const scored = userChunks.map(c => ({ text: c.text, score: cosineSimilarity(qResult.embedding.values, c.embedding) }));
            scored.sort((a, b) => b.score - a.score);
            const context = scored.slice(0, top_k).map(c => c.text).join("\n\n---\n\n");
            
            finalAnswer = await getGeminiResponse(`Context: ${context}\n\nQuestion: ${question}`);
        } else {
            finalAnswer = "Upload a document first.";
        }
    }
    await Chat.create({ userId: req.user.id, chatId: chat_id, question, answer: finalAnswer, mode });
    res.json({ chat_id, question, answer: finalAnswer }); 
  } catch (e) { 
    console.error("ASK ERROR:", e);
    res.status(500).json({ error: e.message }); 
  }
});

app.get("/api/my-docs", auth, async (req, res) => {
    const files = await Chunk.distinct("filename", { userId: req.user.id });
    res.json({ files }); 
});

app.get("/api/chats", auth, async (req, res) => {
    const chats = await Chat.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(req.user.id) } }, { $group: { _id: "$chatId", first_question: { $first: "$question" } } }]);
    res.json({ chats: chats.map(c => ({ chat_id: c._id, title: c.first_question })) });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));