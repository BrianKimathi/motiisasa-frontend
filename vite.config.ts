import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      "/api": {
        target: "https://admin.motiisasa.co.ke",
        changeOrigin: true,
        secure: false, // Use if the API uses a self-signed certificate
        rewrite: (path) => path.replace(/^\/api/, "/api"), // Ensure the /api prefix is preserved
      },
    },
  },
});
