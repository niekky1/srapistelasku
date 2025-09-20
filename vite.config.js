import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // isot kirjastot omiin palasiin
          html2canvas: ['html2canvas'],
          dompurify: ['dompurify'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
