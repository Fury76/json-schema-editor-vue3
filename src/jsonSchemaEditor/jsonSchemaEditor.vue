<template>
  <div class="json-schema-editor">
    <el-card class="schema-editor">
      <template #header>
        <div class="card-header">
          <span>JSON Schema 编辑器</span>
          <el-button type="primary" @click="addRootField">添加字段</el-button>
        </div>
      </template>
      
      <SchemaField
        v-for="(field, key) in schema.properties"
        :key="key"
        v-model:field="schema.properties[key]"
        :fieldName="key"
        :parent="schema"
        :depth="0"
        :required="schema.required || []"
        @update:field="updateField(key, $event)"
        @update:fieldName="updateFieldName(key, $event)"
        @update:required="updateRequired"
        @add-sibling="addSiblingField(key)"
        @remove-field="removeField(key)"
      />

      <template #footer>
        <el-collapse v-model="activeNames">
          <el-collapse-item name="1">
            <template #title>
              <div class="collapse-title">
                {{ activeNames.includes('1') ? '收起' : '展开' }} JSON Schema 预览
              </div>
            </template>
            <div class="json-editor">
            <json-editor-vue class="editor" v-model="schema"/>
            </div>
          </el-collapse-item>
        </el-collapse>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { ElCard, ElButton, ElCollapse, ElCollapseItem } from 'element-plus'
import SchemaField from './schemaField.vue'
import JsonEditorVue from 'json-editor-vue3'


const props = defineProps({
  initialSchema: {
    type: Object,
    default: () => ({})
  }
})

const defaultSchema = {
  type: 'object',
  properties: {},
  required: []
}

const schema = ref(Object.keys(props.initialSchema).length > 0 ? props.initialSchema : defaultSchema)

const emit = defineEmits(['update:schema'])

const activeNames = ref(['0'])  // 默认展开第一个项

const requiredFields = computed(() => {
  return Array.isArray(schema.value.required) ? schema.value.required : []
})

// 监听 props.initialSchema 的变化
watch(() => props.initialSchema, (newSchema) => {
  if (Object.keys(newSchema).length > 0) {
    schema.value = newSchema
  } else {
    schema.value = defaultSchema
  }
}, { deep: true })

// 在组件挂载时确保 schema 有正确的结构
onMounted(() => {
  if (Object.keys(schema.value).length === 0) {
    schema.value = defaultSchema
  }
})

const updateSchema = () => {
  try {
    const schemaToEmit = JSON.parse(JSON.stringify(schema.value))
    emit('update:schema', schemaToEmit)
  } catch (error) {
    emit('update:schema', { type: 'object', properties: {} })
  }
}

const updateField = (key, newValue) => {
  schema.value.properties[key] = newValue
  updateSchema()
}

const updateFieldName = (oldKey, newKey) => {
  if (oldKey !== newKey) {
    const value = schema.value.properties[oldKey]
    delete schema.value.properties[oldKey]
    schema.value.properties[newKey] = value

    // 更新 required 数组
    if (schema.value.required) {
      const index = schema.value.required.indexOf(oldKey)
      if (index !== -1) {
        schema.value.required[index] = newKey
      }
    }

    updateSchema()
  }
}

const updateRequired = (fieldName, isRequired) => {
  if (!Array.isArray(schema.value.required)) {
    schema.value.required = []
  }
  if (isRequired) {
    if (!schema.value.required.includes(fieldName)) {
      schema.value.required.push(fieldName)
    }
  } else {
    schema.value.required = schema.value.required.filter(name => name !== fieldName)
  }
  updateSchema()
}

const addRootField = () => {
  if (!schema.value.properties) {
    schema.value.properties = {}
  }
  const newField = {
    type: 'string',
    description: ''
  }
  const fieldName = 'newField' + Object.keys(schema.value.properties).length
  schema.value.properties[fieldName] = newField
  updateSchema()
}

const addSiblingField = (key) => {
  const newField = {
    type: 'string',
    description: ''
  }
  const fieldName = 'newField' + Object.keys(schema.value.properties).length
  schema.value.properties[fieldName] = newField
  updateSchema()
}

const removeField = (key) => {
  delete schema.value.properties[key]
  schema.value.required = schema.value.required.filter(field => field !== key)
  updateSchema()
}

// 确保 schema.required 总是一个数组
const ensureRequiredArray = computed(() => {
  return Array.isArray(schema.value.required) ? schema.value.required : []
})

// 使用 computed 属性替代直接访问 schema.required
const isFieldRequired = (fieldName) => {
  return ensureRequiredArray.value.includes(fieldName)
}


const parsedSchema = computed(() => {
  try {
    if (typeof formData.value.parameters === 'string') {
      return JSON.parse(formData.value.parameters)
    } else if (typeof formData.value.parameters === 'object') {
      return formData.value.parameters
    }
    return { type: 'object', properties: {} }
  } catch (error) {
    console.error('Invalid JSON Schema:', error)
    return { type: 'object', properties: {} }
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* 确保 el-card 的 footer 没有 padding 和 margin */
:deep(.el-card__footer) {
  padding: 0 !important;
  margin: 0 !important;
}

/* 移除 el-collapse 的边框 */
.el-collapse {
  border: none;
}

/* 确保 el-collapse-item__header 占满整个 footer，且没有 padding 或 margin */
.json-schema-editor .el-collapse-item__header {
  padding: 0 !important;
  margin: 0 !important;
  width: 100%;
  border: none; /* 去掉边框 */
}

/* 移除 el-collapse-item header 的 padding、margin，确保它紧贴 */
.el-collapse-item__wrap {
  padding: 0 !important;
  margin: 0 !important;
  border: none !important; /* 去掉边框 */
}

/* 让 el-collapse-item 的 icon 区域也完全贴合 */
.el-collapse-item__header {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important; /* 去掉边框 */
}

/* 移除可能的折叠图标的 margin 或 padding，确保其紧贴 */
.el-collapse-item__header > .el-collapse-item__icon {
  margin: 0 !important;
  padding: 0 !important;
}

/* 自定义的 collapse-item icon 样式，确保在中心且无多余间距 */
.el-collapse-item__icon {
  width: 100%;
  text-align: center;
  background: none;
  border: none;
  height: 40px; /* 自定义高度 */
  line-height: 40px; /* 垂直居中 */
  padding: 0;
  margin: 0;
}

.collapse-title {
  width: 100%;
  text-align: center;
  cursor: pointer;
  color: #409EFF; /* 使用 Element Plus 的主色调 */
  font-weight: bold;
}


</style>