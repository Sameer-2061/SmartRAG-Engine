import { useState } from "react";
import { login, signup } from "./api";

export default function Login({ onLoggedIn }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = isSignup ? signup : login;
      const res = await fn(email, password);
      localStorage.setItem("token", res.data.token);
      onLoggedIn();
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isSignup ? "Create an Account" : "Welcome Back"}</h2>
        <p style={styles.subtitle}>
          {isSignup ? "Sign up to access your AI RAG workspace." : "Log in to your AI RAG workspace."}
        </p>

        <form onSubmit={submit} style={styles.form}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}
            onMouseOver={(e) => e.target.style.transform = "scale(1.03)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
          >
            {loading ? "Processing..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        {error && <div style={styles.errorBox}>{error}</div>}

        <p onClick={() => setIsSignup(!isSignup)} style={styles.toggleText}>
          {isSignup ? "Already have an account? Log in." : "Don't have an account? Sign up."}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  card: { 
    background: "linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(135deg, #4285f4, #9b72cb, #d96570) border-box",
    border: "2px solid transparent",
    padding: "40px", 
    borderRadius: "24px", 
    width: "100%", 
    maxWidth: "420px", 
    boxShadow: "0 10px 50px rgba(0,0,0,0.8)" 
  },
  title: { color: "#ffffff", fontSize: "26px", marginBottom: "8px", textAlign: "center", fontWeight: "600" },
  subtitle: { color: "#a1a1aa", fontSize: "14px", marginBottom: "28px", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  input: { padding: "14px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)", color: "#ffffff", fontSize: "15px", outline: "none", transition: "border 0.3s" },
  button: { padding: "14px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #4285f4, #9b72cb, #d96570)", color: "#ffffff", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "transform 0.2s" },
  errorBox: { marginTop: "16px", padding: "12px", backgroundColor: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid #ef4444", color: "#ef4444", fontSize: "14px", borderRadius: "4px" },
  toggleText: { marginTop: "24px", textAlign: "center", color: "#a1a1aa", fontSize: "14px", cursor: "pointer", transition: "color 0.2s" }
};