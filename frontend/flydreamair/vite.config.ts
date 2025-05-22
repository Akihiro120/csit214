import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        svgr(),
        tailwindcss(),
        TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
        react(),
    ],
    base: '/csit214/',
    server: {
        host: true, // This makes Vite listen on all public IPs, including 127.0.0.1
        proxy: {
            // Add this proxy configuration
            '/api': {
                target: 'http://localhost:3000', // Your backend server address
                changeOrigin: true, // Recommended for virtual hosted sites
                // secure: false, // Uncomment if your backend is on HTTPS with a self-signed certificate
                // rewrite: (path) => path.replace(/^\/api/, '') // Uncomment if your backend doesn't expect /api prefix
            },
        },
    },
    build: {
        target: 'esnext',
    },
    preview: {
        port: 5173,
        host: true,
    },
});
