import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy splat files in dev so Content-Length is preserved.
      // Vercel Blob CDN applies Brotli compression which strips Content-Length;
      // drei's SplatLoader requires it.
      '/splat-proxy': {
        target: 'https://jslyit1chyjxlulc.public.blob.vercel-storage.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/splat-proxy/, ''),
        headers: { 'Accept-Encoding': 'identity' },
      },
    },
  },
})
