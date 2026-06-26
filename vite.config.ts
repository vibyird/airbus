import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { cloudflare } from '@cloudflare/vite-plugin'

// 这就是一个超简单的自定义纯文本插件
function string() {
  return {
    name: 'string-plugin',
    transform(code: string, id: string) {
      // 如果是以 .yaml 结尾的文件
      if (id.endsWith('.yaml')) {
        // 将读取到的 YAML 文本直接作为默认导出返回
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
})
