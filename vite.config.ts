import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@point-of-sale/webcam-barcode-scanner/dist/webcam-barcode-scanner.worker.js",
          dest: ".",
        },
        {
          src: "node_modules/@point-of-sale/webcam-barcode-scanner/dist/webcam-barcode-scanner.wasm",
          dest: ".",
        },
      ],
    }),
  ],
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
