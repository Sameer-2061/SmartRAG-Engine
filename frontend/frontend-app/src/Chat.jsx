import { useState, useEffect, useRef } from "react";
import API, { newChat, ask, uploadFile } from "./api";

export default function Chat({ onLogout }) {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([{ role: "bot", text: "Welcome to your intelligent workspace! Upload a document or ask me anything." }]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("document"); // Naya state mode ke liye
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [recentChats, setRecentChats] = useState([]); 
  const chatEndRef = useRef(null);

  useEffect(() => {
    newChat().then((res) => setChatId(res.data.chat_id));

    API.get("/my-docs")
      .then((res) => { if (res.data.files) setUploadedFiles(res.data.files); })
      .catch((err) => console.error("Failed to load documents", err));

    API.get("/chats")
      .then((res) => { if (res.data.chats) setRecentChats(res.data.chats); })
      .catch((err) => console.error("Failed to load chats", err));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus(`Uploading ${file.name}...`);
    try {
      await uploadFile(file);
      setStatus(`${file.name} successfully added.`);
      if (!uploadedFiles.includes(file.name)) {
        setUploadedFiles(prev => [...prev, file.name]);
      }
    } catch {
      setStatus("Upload failed. Ensure backend is running.");
    }
    setTimeout(() => setStatus(""), 5000);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input;
    
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    
    try {
      // Ab hum mode (document/global) bhi backend ko bhej rahe hain
      const res = await ask(chatId, question, mode);
      setMessages((m) => [...m, { role: "bot", text: res.data.answer }]);
      
      if (messages.length === 1) {
          setRecentChats(prev => [{ chat_id: chatId, title: question }, ...prev]);
      }
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Connection error. Is the backend running?" }]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i} style={{ display: "block", marginBottom: "8px" }}>
          {parts.map((part, j) => (
            j % 2 === 1 ? <strong key={j} style={{color: "#fff"}}>{part}</strong> : part
          ))}
        </span>
      );
    });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.layout}>
        
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.logo}>
              <div style={styles.statusDot}></div> RAG Engine
            </h2>
            <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
          </div>
          
          <div style={styles.uploadSection}>
            <h3 style={styles.sectionTitle}>Knowledge Base</h3>
            <p style={styles.sectionDesc}>Expand your AI's brain.</p>
            
            <label htmlFor="file-upload" style={styles.uploadLabel}
              onMouseOver={(e) => { e.target.style.borderColor = "#9b72cb"; e.target.style.color = "#fff"; }}
              onMouseOut={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.color = "#a1a1aa"; }}
            >
              Choose Document
            </label>
            <input id="file-upload" type="file" accept=".txt,.pdf,.docx" onChange={handleUpload} style={{ display: "none" }} />
            {status && <div style={styles.statusBox}>{status}</div>}
          </div>

          <div style={styles.listSection}>
            <h3 style={styles.sectionTitle}>Your Documents</h3>
            {uploadedFiles.length === 0 ? (
               <div style={{...styles.listItem, color: "#666", fontStyle: "italic", border: "none"}}>No documents yet.</div>
            ) : (
              uploadedFiles.map((f, i) => (
                <div key={i} style={styles.listItem}>{f}</div>
              ))
            )}
          </div>

          <div style={styles.listSection}>
              <h3 style={styles.sectionTitle}>Recent Chats</h3>
              {recentChats.length === 0 ? (
                  <div style={{...styles.listItem, color: "#666", fontStyle: "italic", border: "none"}}>No history found.</div>
              ) : (
                  recentChats.map((c, i) => (
                      <div key={i} style={styles.listItem}>{c.title.length > 25 ? c.title.substring(0, 25) + "..." : c.title}</div>
                  ))
              )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={styles.main}>
          <div style={styles.chatArea}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...styles.messageWrapper, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ ...styles.messageBubble, 
                              backgroundColor: m.role === "user" ? "var(--user-bubble)" : "var(--bot-bubble)", 
                              border: m.role === "user" ? "none" : "1px solid var(--border-color)",
                              boxShadow: m.role === "user" ? "0 4px 15px rgba(23, 59, 138, 0.3)" : "none" }}>
                  {m.role === "bot" && <div style={styles.botIcon}>AI</div>}
                  <div style={styles.messageText}>{formatText(m.text)}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.messageWrapper, justifyContent: "flex-start" }}>
                <div style={{ ...styles.messageBubble, backgroundColor: "transparent", border: "1px solid var(--border-color)" }}>
                  <div style={styles.botIcon}>AI</div>
                  <div style={{ color: "#a1a1aa", fontStyle: "italic", marginTop: "2px" }}>Thinking...</div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Slider and Input Bar Container */}
          <div style={styles.inputContainer}>
            
            {/* The Mode Slider */}
            <div style={styles.controlsArea}>
              <span style={{...styles.modeLabel, color: mode === "document" ? "#fff" : "#a1a1aa", textShadow: mode === "document" ? "0 0 10px rgba(255,255,255,0.3)" : "none"}}>
                Document Mode
              </span>
              <div 
                style={styles.switch} 
                onClick={() => setMode(mode === "document" ? "global" : "document")}
              >
                <div style={{
                  ...styles.track, 
                  background: mode === "global" ? "linear-gradient(135deg, #4285f4, #9b72cb, #d96570)" : "#333"
                }}>
                  <div style={{
                    ...styles.thumb,
                    transform: mode === "global" ? "translateX(22px)" : "translateX(0)"
                  }}></div>
                </div>
              </div>
              <span style={{...styles.modeLabel, color: mode === "global" ? "#fff" : "#a1a1aa", textShadow: mode === "global" ? "0 0 10px rgba(255,255,255,0.3)" : "none"}}>
                Global AI Mode
              </span>
            </div>

            {/* Input Box */}
            <div style={styles.inputBox}>
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && send()} 
                placeholder={mode === "global" ? "Ask general questions to Global AI..." : "Ask questions about your uploaded Docs..."} 
                style={styles.chatInput} 
                disabled={loading} 
              />
              <button onClick={send} style={styles.sendBtn} disabled={loading || !input.trim()}
                onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.target.style.transform = "scale(1)"}
              >Send</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    padding: "2vh 2vw"
  },
  layout: { 
    display: "flex", 
    width: "100%", 
    maxWidth: "1400px",
    height: "100%", 
    background: "linear-gradient(#0a0a0f, #0a0a0f) padding-box, var(--nexus-gradient) border-box",
    border: "2px solid transparent",
    borderRadius: "24px",
    boxShadow: "0 10px 50px rgba(0, 0, 0, 0.8)",
    overflow: "hidden" 
  },
  sidebar: { width: "280px", backgroundColor: "transparent", display: "flex", flexDirection: "column", borderRight: "1px solid var(--border-color)", overflowY: "auto" },
  sidebarHeader: { padding: "24px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "rgba(10, 10, 15, 0.95)", zIndex: 10, backdropFilter: "blur(10px)" },
  logo: { margin: 0, fontSize: "16px", fontWeight: "600", color: "#ffffff", display: "flex", alignItems: "center", gap: "10px" },
  statusDot: { width: "10px", height: "10px", backgroundColor: "var(--status-green)", borderRadius: "50%", boxShadow: "0 0 8px var(--status-green)" },
  logoutBtn: { backgroundColor: "transparent", border: "1px solid var(--border-color)", color: "#a1a1aa", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", transition: "all 0.2s" },
  uploadSection: { padding: "24px 20px", display: "flex", flexDirection: "column", gap: "12px" },
  listSection: { padding: "0 20px 20px 20px", display: "flex", flexDirection: "column", gap: "8px" },
  sectionTitle: { margin: 0, fontSize: "11px", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" },
  sectionDesc: { margin: 0, fontSize: "13px", color: "#777", lineHeight: "1.4" },
  uploadLabel: { backgroundColor: "transparent", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "12px", textAlign: "center", cursor: "pointer", color: "#a1a1aa", fontWeight: "500", fontSize: "0.9rem", transition: "all 0.3s" },
  statusBox: { padding: "12px", backgroundColor: "rgba(255,255,255,0.03)", borderLeft: "3px solid #4285f4", fontSize: "13px", borderRadius: "6px", color: "#f4f4f5" },
  listItem: { fontSize: "13px", color: "#f4f4f5", padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", border: "1px solid var(--border-color)" },
  main: { flex: 1, display: "flex", flexDirection: "column", position: "relative", backgroundColor: "transparent" },
  chatArea: { flex: 1, overflowY: "auto", padding: "40px 6%", display: "flex", flexDirection: "column", gap: "24px" },
  messageWrapper: { display: "flex", width: "100%" },
  messageBubble: { display: "flex", gap: "14px", padding: "16px 20px", borderRadius: "16px", maxWidth: "80%", lineHeight: "1.6", fontSize: "0.95rem", color: "#f4f4f5" },
  botIcon: { fontSize: "11px", fontWeight: "600", backgroundColor: "rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "6px", alignSelf: "flex-start", marginTop: "2px", letterSpacing: "1px" },
  messageText: { flex: 1 },
  inputContainer: { padding: "15px 6% 20px 6%", backgroundColor: "transparent", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" },
  
  /* Slider Styles */
  controlsArea: { display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", marginBottom: "5px" },
  modeLabel: { fontSize: "0.85rem", fontWeight: "500", transition: "color 0.3s, text-shadow 0.3s" },
  switch: { position: "relative", display: "inline-block", width: "46px", height: "24px", cursor: "pointer" },
  track: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, transition: ".4s", borderRadius: "24px" },
  thumb: { position: "absolute", height: "18px", width: "18px", left: "3px", bottom: "3px", backgroundColor: "white", transition: "transform .4s cubic-bezier(0.4, 0.0, 0.2, 1)", borderRadius: "50%" },
  
  inputBox: { display: "flex", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "30px", padding: "6px", border: "1px solid var(--border-color)", transition: "border 0.3s" },
  chatInput: { flex: 1, backgroundColor: "transparent", border: "none", color: "#fff", padding: "10px 16px", fontSize: "0.95rem", outline: "none" },
  sendBtn: { backgroundColor: "white", color: "#000", border: "none", padding: "0 24px", borderRadius: "24px", fontWeight: "600", cursor: "pointer", transition: "transform 0.2s" }
};