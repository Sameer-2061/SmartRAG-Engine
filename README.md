#  SmartRAG Engine: Advanced Document Intelligence + MERN

![Live Deployment](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/MERN-Vite_React_|_Node.js_|_Express_|_MongoDB-blue?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Google_Gemini_1.5-orange?style=for-the-badge)

A production-grade Retrieval-Augmented Generation (RAG) system built to chat with large documents accurately. It extracts text, generates mathematical vector embeddings, and uses custom algorithms to retrieve precise context, eliminating AI hallucinations.

###  Live Links
* **Frontend Application:** [https://smart-rag-engine.vercel.app](https://smart-rag-engine.vercel.app)
* **Backend API:** `https://smartrag-engine.onrender.com/api`

---

## 💡 Real-World Applications (Use Cases)
* **Legal & Compliance:** Lawyers can instantly query 100-page contracts to find specific clauses without reading the whole document.
* **Academic Research & Study:** Students can upload dense research papers or textbooks and ask for concept breakdowns or summaries.
* **HR & Corporate Onboarding:** Employees can chat with company policy PDFs to quickly find information about leaves, benefits, or IT rules.
* **Financial Analysis:** Extracting specific revenue data or risk factors from massive annual reports.

---

## 🛠️ Technical Architecture & Stack

**Frontend (Client)**
* **React (Vite):** Fast, modern UI rendering.
* **Axios:** For seamless API communication.
* **CSS:** Clean, responsive, and distraction-free user interface.
* **Deployment:** Vercel

**Backend (Server & Logic)**
* **Node.js & Express.js:** Robust REST API architecture.
* **Multer & PDF-Parse:** For handling multipart form data and extracting text from complex PDFs.
* **Google Gemini API (`@google/generative-ai`):** Utilized for both generating text embeddings and the final LLM response.
* **Deployment:** Render

**Database**
* **MongoDB Atlas & Mongoose:** Storing user credentials, document metadata, and high-dimensional vector embeddings efficiently.

---

## Key Learnings & Engineering Decisions

Building this project taught me how to bridge the gap between simple web development and core software engineering:

1. **Algorithmic Problem Solving in System Design:** Instead of relying on expensive, black-box vector databases right away, I implemented the **Cosine Similarity algorithm** from scratch in JavaScript. This deepened my understanding of how data structures and mathematical vectors interact in high-level applications.
2. **Dynamic Load Balancing & Fallbacks:** I implemented a defensive fallback mechanism. If the primary `gemini-1.5-pro` model hits a `429 Rate Limit` (Too Many Requests), the backend catches the error and dynamically routes the request to the faster `gemini-1.5-flash` model. This ensures zero downtime and a seamless user experience.
3. **Handling Asynchronous Heavy Workloads:** Processing large PDFs into hundreds of chunks and generating embeddings for each can block the Node.js event loop. I learned to optimize `Promise.all()` and handle batch processing efficiently.
4. **Cross-Platform Deployment complexities:** Successfully managing a Monorepo, configuring environment variables securely across Vercel and Render, and fixing Linux/Windows case-sensitivity bugs during deployment.

---

## Future Scope & Improvements
* **Integration of a Native Vector DB:** Migrating the vector storage from MongoDB to a dedicated Vector Database like Pinecone or Weaviate for lightning-fast semantic search at massive scale.
* **Persistent Chat Memory:** Implementing conversation history so the LLM remembers previous questions within the same session.
* **OCR Support:** Integrating Tesseract.js or a vision model to extract and chat with text from scanned images and un-selectable PDFs.
* **Caching Layer:** Adding Redis to cache frequent queries and reduce API calls to the LLM.

---

##  Run Locally

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/Sameer-2061/SmartRAG-Engine.git
cd SmartRAG-Engine
\`\`\`

**2. Setup Backend**
\`\`\`bash
cd backend
npm install
# Create a .env file and add: GEMINI_API_KEY, MONGO_URI, and JWT_SECRET
node server.js
\`\`\`

**3. Setup Frontend**
\`\`\`bash
cd ../frontend/frontend-app
npm install
npm run dev
\`\`\`