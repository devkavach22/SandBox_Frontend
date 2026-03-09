import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 6000,
    host: true,          // allows access from LAN / 0.0.0.0
    strictPort: true,    // fail if port 6000 is in use
    cors: true           // allow all origins (*)
  },

  plugins: [
    tailwindcss(),
  ],
})