import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  // 固定端口并启用 strictPort，避免端口自动漂移
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    open: '/home',
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
