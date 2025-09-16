import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/omninova/',
  server: {
    port: 3030,     // change to any free port you want
    host: true,     // 👈 allows access from other devices in your LAN
  },
})
