import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
    plugins: [react()],
    server: { host: "0.0.0.0", port: 8082 },
    resolve: { alias: { "@": path.resolve(__dirname, "./src") }, dedupe: ["react", "react-dom"] },
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.includes("node_modules/convex") || id.includes("node_modules/@convex-dev"))
                        return "vendor-convex";
                    if (id.includes("node_modules/framer-motion"))
                        return "vendor-motion";
                    if (id.includes("node_modules/react"))
                        return "vendor-react";
                },
            },
        },
    },
});
