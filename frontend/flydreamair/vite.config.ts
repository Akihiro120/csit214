import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
	plugins: [svgr(), tailwindcss(), TanStackRouterVite({ target: "react", autoCodeSplitting: true }), react()],
	base: "/",
	server: {
		// Add this server configuration block
		host: true, // This makes Vite listen on all public IPs, including 127.0.0.1
	},
});
