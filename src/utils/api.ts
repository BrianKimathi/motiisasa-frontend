import axios from "axios";

const api = axios.create({
  baseURL: "https://admin.motiisasa.co.ke/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

export default api;
