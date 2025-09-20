import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,              // ← väliaikainen: saat selkeät rivit ja funktioiden nimet
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          dompurify: ['dompurify'],
          html2canvas: ['html2canvas'],
        },
      },
    },
  },
})
