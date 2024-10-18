import esbuild from 'esbuild'
import vuePlugin from 'esbuild-plugin-vue3'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import path from 'path'

const isLibMode = process.env.MODE === 'lib'

const sharedConfig = {
  entryPoints: [isLibMode ? 'src/index.ts' : 'index.html'],
  bundle: true,
  minify: true,
  sourcemap: false,
  plugins: [vuePlugin()],
  resolveExtensions: ['.js', '.ts', '.vue'],
  external: ['vue'],
  loader: {
    '.svg': 'file', // 添加对 .svg 文件的处理
    '.html': 'text' // 让 esbuild 识别 HTML 文件
  }
}

if (isLibMode) {
  // 库模式下的配置
  esbuild.build({
    ...sharedConfig,
    format: 'esm',
    outfile: path.join('dist', 'json-schema-editor.esm.js'),
    globalName: 'JsonSchemaEditor',
  }).catch(() => process.exit(1))
} else {
  // 开发模式或者普通构建的配置
  esbuild.build({
    ...sharedConfig,
    format: 'esm',
    outdir: 'dist',  // 输出到目录
    plugins: [
      vuePlugin(),
      nodeResolve() // 支持 ES Module 的模块解析
    ]
  }).catch(() => process.exit(1))
}
