// export default API;
import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:5000/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export const signup = (email, password) => API.post("/signup", { email, password });
export const login = (email, password) => API.post("/login", { email, password });
export const newChat = () => API.get("/new-chat");

// Yahan mode parameter add kiya gaya hai
export const ask = (chat_id, question, mode) => API.post("/ask", { chat_id, question, mode });

export const uploadFile = (file) => {
  const form = new FormData();
  form.append("file", file);
  return API.post("/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
};

export default API;