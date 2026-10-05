import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", port: 8082 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "convex/react": path.resolve(__dirname, "./src/lib/convex-compat.ts"),
      "@convex-dev/auth/react": path.resolve(__dirname, "./src/lib/convex-auth-compat.tsx"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";
          if (id.includes("node_modules/react")) return "vendor-react";
        },
      },
    },
  },
});
