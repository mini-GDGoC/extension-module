// vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir:       'dist',
    emptyOutDir:  true,
    target:       'es2015',
    minify:       false,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/background.ts'),
        content:    resolve(__dirname, 'src/content/content.tsx'),
        //pageInteraction: resolve(__dirname, 'src/content/pageInteraction.ts'),

      },
      output: {
        // → put them in the root, not assets/
        entryFileNames: '[name].js',
        // shared chunks (if any) will go under chunks/
        chunkFileNames: 'chunks/[name].js',
        // static assets (images/css) still under assets/
        assetFileNames: 'assets/[name].[ext]',
        // ES modules support MV3 code-splitting
        format: 'es'
      }
    }
  },
  // copy everything from public/ → dist/
  publicDir: 'public'
})
