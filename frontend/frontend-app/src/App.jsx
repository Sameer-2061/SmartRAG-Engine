import { useState } from "react";
import Login from "./Login";
import Chat from "./Chat";
import "./App.css"; 

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  return (
    <>
      {loggedIn 
        ? <Chat onLogout={logout} /> 
        : <Login onLoggedIn={() => setLoggedIn(true)} />
      }
      
      {/*Digital Watermark Footer */}
      <div style={footerStyle}>
        Developed and Engineered by Sameer from NIT Kurukshetra and Here's my {" "}
        <a 
          href="https://www.linkedin.com/in/sameer-kumar-4b1062257/" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={linkStyle}
          onMouseOver={(e) => e.target.style.color = "#fff"}
          onMouseOut={(e) => e.target.style.color = "#a1a1aa"}
        >
          LinkedIn Profile
        </a>
      </div>
    </>
  );
}

// Professional, Minimal, and Non-Intrusive Styling
const footerStyle = {
  position: "fixed",
  bottom: "12px",
  width: "100%",
  textAlign: "center",
  fontSize: "12px",
  color: "#a1a1aa", // Muted text color matching your app's theme
  zIndex: 9999, // Ensures it stays on top of everything
  pointerEvents: "none", // Prevents the footer container from blocking clicks behind it
  letterSpacing: "0.5px"
};

const linkStyle = {
  color: "#a1a1aa",
  textDecoration: "none",
  fontWeight: "500",
  pointerEvents: "auto", // Allows only the link itself to be clickable
  transition: "color 0.3s ease",
  borderBottom: "1px solid rgba(161, 161, 170, 0.4)"
};
