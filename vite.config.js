- import { defineConfig } from 'vite'
+ import { defineConfig, splitVendorChunkPlugin } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
-   plugins: [react()],
-   base: '/',
-   build: { outDir: 'dist' }
+   plugins: [react(), splitVendorChunkPlugin()],
+   base: '/',
+   build: {
+     outDir: 'dist',
+     sourcemap: true,
+     rollupOptions: {
+       output: {
+         manualChunks: {
+           react: ['react', 'react-dom'],
+           dompurify: ['dompurify'],
+           html2canvas: ['html2canvas'],
+         },
+       },
+     },
+   }
  })
