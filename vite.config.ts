import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode }) => {
  // '' 로 하면 VITE_ 접두사 없이도 .env 변수 전부를 불러옵니다
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // import.meta.env.RTZR_CLIENT_ID 에 실제 값 주입
      'import.meta.env.RTZR_CLIENT_ID': JSON.stringify(env.RTZR_CLIENT_ID),
      'import.meta.env.RTZR_CLIENT_SECRET': JSON.stringify(env.RTZR_CLIENT_SECRET),
    },
    build: {
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'popup.html'),
          content: resolve(__dirname, 'src/content/content.ts'),
          background: resolve(__dirname, 'src/background/background.ts'),
        },
        output: {
          entryFileNames: assetInfo => {
            if (assetInfo.name === 'content') return 'content.js'
            return '[name].js'
          }
        },
      },
      outDir: 'dist',
      emptyOutDir: true
    }
  }
})
