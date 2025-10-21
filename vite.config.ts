import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["@point-of-sale/webcam-barcode-scanner"],
  },
  server: {
    fs: {
      strict: false,
    },
    // DEV ONLY
    proxy: {
      "/api": {
        target: "https://mail.hackclub.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/letters/, "/api/v1/letters"),
      },
    },
  },
});
