import { cloudflare } from '@cloudflare/vite-plugin'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

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
      '@': path.resolve(import.meta.dirname, 'src'),
      '@server': path.resolve(import.meta.dirname, 'server'),
    },
  },
  build: {
    cssMinify: 'esbuild',
  },
})
