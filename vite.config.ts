import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  
  // Add this CSS configuration
  css: {
    postcss: "./postcss.config.cjs",
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@services": path.resolve(__dirname, "./src/services"),
    },
  },
  
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxies /api/musixmatch/* → https://api.musixmatch.com/ws/1.1/* in dev,
      // bypassing CORS. In production, api/musixmatch.ts (Vercel function) does the same.
      '/api/musixmatch': {
        target: 'https://api.musixmatch.com/ws/1.1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/musixmatch/, ''),
      },
    },
  },
  
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});