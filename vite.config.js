import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';

// Load environment variables
config();

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/index.tsx'],
            refresh: false, // Disable hot reload to prevent infinite reloading
        }),
    ],
    define: {
        'import.meta.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY || ''),
    },
    server: {
        hmr: false, // Disable hot module replacement
        watch: {
            usePolling: false,
            interval: 1000,
        }
    },
});