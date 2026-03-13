import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],

  server: {
    host: true, // Allow external access

    // All domains you listed
    allowedHosts: [
      'sandbox.kavachglobal.com',
      '110.226.96.148'
    ],

    // Useful for HMR when accessed through proxy/other domain
    hmr: {
      host: 'sandbox.kavachglobal.com',
      protocol: 'https'
    },

    // Optional: set main origin for generated asset URLs
    origin: 'https://sandbox.kavachglobal.com:5173'
  }
})