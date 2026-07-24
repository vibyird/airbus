import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { cloudflare } from '@cloudflare/vite-plugin'

function string() {
  return {
    name: 'string-plugin',
    transform(code: string, id: string) {
      if (id.endsWith('.yaml') || id.endsWith('.conf')) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: '' },
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), string(), cloudflare()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@server/*': fileURLToPath(new URL('./server', import.meta.url)),
    },
  },
  build: {
    cssMinify: 'esbuild',
  },
})
