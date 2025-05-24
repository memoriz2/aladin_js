import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// 환경 변수로 base URL 설정
const base = process.env.NODE_ENV === "production" ? "/aladin_js/" : "/";

export default defineConfig({
    plugins: [react()],
    base: "/aladin_js/",
    build: {
        outDir: "dist",
        assetsDir: "assets",
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
            },
        },
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
});
