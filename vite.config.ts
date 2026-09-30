import { cloudflare } from '@cloudflare/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'

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
  plugins: [vue(), vuetify(), vueDevTools(), string(), cloudflare()],
  build: {
    cssMinify: 'esbuild',
  },
})
