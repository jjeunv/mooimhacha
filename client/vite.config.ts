import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
    },
  },
  plugins: [react()],
  server: {
    // 백엔드(localhost:3000)와 포트 충돌 방지
    port: 5173,
  },
});
