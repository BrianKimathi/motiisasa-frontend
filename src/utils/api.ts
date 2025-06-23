// src/utils/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://admin.motiisasa.co.ke/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
