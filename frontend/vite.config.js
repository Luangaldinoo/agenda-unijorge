import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, as chamadas a /api são encaminhadas para o backend (porta 3333).
const proxy = { '/api': { target: process.env.VITE_API_URL || 'http://localhost:3333', changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
});
