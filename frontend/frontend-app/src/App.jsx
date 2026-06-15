import { useState } from "react";
import Login from "./Login";
import Chat from "./Chat";
import "./App.css"; // Optional if you have global resets

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  return loggedIn 
    ? <Chat onLogout={logout} /> 
    : <Login onLoggedIn={() => setLoggedIn(true)} />;
}