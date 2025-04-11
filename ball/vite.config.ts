import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve:{
    alias: {
      "@":path.resolve(__dirname, "./src")
    }
  },
  build: {
  outDir: 'dist', // Carpeta de salida para archivos estáticos de Django
  emptyOutDir: true,
  },
  server: {
  port: 3000,
  proxy: {
  '/api': 'http://127.0.0.1:8000', // Redirecciona las solicitudes de API a Django durante el desarrollo
  },
  },
 })
