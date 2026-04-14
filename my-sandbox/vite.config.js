import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),    
    tailwindcss(),
  ],

  server: {
    host: '0.0.0.0', // allow access from localhost + IP + domain
    port: 8080,
    strictPort: true,

    allowedHosts: [
      'sandbox.kavachglobal.com',
      '110.226.96.148',
      '192.168.11.226',
      '172.18.16.1',
      'localhost',
      '*'
    ],
  }
})