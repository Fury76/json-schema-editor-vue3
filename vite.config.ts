import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

// 判断当前环境
const isLibMode = process.env.MODE === 'lib'

export default defineConfig({
  plugins: [vue(), viteCommonjs()],
  build: isLibMode
    ? {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'), // 库的入口文件
          name: 'JsonSchemaEditor',
          fileName: (format) => `json-schema-editor.${format}.js`
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue'
            }
          }
        }
      }
    : {
        outDir: 'dist',
        rollupOptions: {
          input: path.resolve(__dirname, 'index.html'), // 开发环境下需要指向 index.html
        }
      }
})
