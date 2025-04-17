import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), TanStackRouterVite({ target: "react", autoCodeSplitting: true }), react()],
	base: process.env.NODE_ENV === "development" ? "/" : "https://akihiro120.github.io/csit214/",
});
