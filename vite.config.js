import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" にしておくと GitHub Pages のサブパス配信でも動作します
export default defineConfig({
  base: "./",
  plugins: [react()],
});
