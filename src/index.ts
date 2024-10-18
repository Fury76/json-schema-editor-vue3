import { App } from 'vue'
import JsonSchemaEditor from './jsonSchemaEditor/JsonSchemaEditor.vue'

// 定义插件的 install 方法，使得用户可以全局安装
export default {
  install(app: App) {
    app.component('JsonSchemaEditor', JsonSchemaEditor)
  }
}

// 按需导出组件
export { JsonSchemaEditor }
