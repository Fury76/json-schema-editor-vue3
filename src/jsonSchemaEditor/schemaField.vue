<template>
  <div class="schema-field">
    <el-row :gutter="20">
      <el-col :span="getInputSpan()" :offset="depth">
        <el-input 
          v-model="localFieldName" 
          placeholder="字段名" 
          @change="updateFieldName"
          :disabled="isArrayItem"
        />
      </el-col>
      <el-col :span="4">
        <el-select v-model="localField.type" placeholder="类型" @change="handleTypeChange">
          <el-option v-for="type in types" :key="type" :label="type" :value="type" />
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-checkbox 
          v-model="isRequired" 
          label="必填" 
          @change="updateRequired"
          :disabled="isArrayItem"
        />
      </el-col>
      <el-col :span="1">
        <el-tooltip content="高级设置" placement="top">
          <el-button type="info" circle size="small" @click="showAdvancedSettings = true">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1" v-if="localField.type === 'object'">
        <el-tooltip content="添加子字段" placement="top">
          <el-button type="success" circle size="small" @click="addSubField">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1" v-if="localField.type !== 'object' && parent && !isArrayItem">
        <el-tooltip content="添加兄弟字段" placement="top">
          <el-button type="success" circle size="small" @click="$emit('add-sibling')">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1" v-if="parent && !isArrayItem">
        <el-tooltip content="删除字段" placement="top">
          <el-button type="danger" circle size="small" @click="removeField">
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </el-col>
    </el-row>

    <div v-if="localField.type === 'object' && localField.properties" class="sub-fields">
      <SchemaField
        v-for="(subField, key) in localField.properties"
        :key="key"
        v-model:field="localField.properties[key]"
        :fieldName="key"
        :parent="localField"
        :depth="depth + 1"
        :required="localField.required || []"
        @update:field="updateSubField(key, $event)"
        @update:fieldName="updateSubFieldName(key, $event)"
        @update:required="updateSubRequired"
        @add-sibling="addSiblingToObject(key)"
        @remove-field="removeSubField(key)"
      />
    </div>
    <div v-else-if="localField.type === 'array' && localField.items" class="sub-fields">
      <SchemaField
        v-model:field="localField.items"
        :parent="localField"
        :depth="depth + 1"
        :is-array-item="true"
        @update:field="updateArrayItems"
      />
    </div>

    <el-dialog v-model="showAdvancedSettings" title="高级属性设置">
      <el-form label-width="120px" class="advanced-settings-form">
        <el-form-item label="描述">
          <el-input v-model="localField.description" type="textarea" :rows="3" />
        </el-form-item>
        
        <!-- String 类型设置 -->
        <template v-if="localField.type === 'string'">
          <el-form-item label="最小长度">
            <el-input-number v-model="localField.minLength" :min="0" />
          </el-form-item>
          <el-form-item label="最大长度">
            <el-input-number v-model="localField.maxLength" :min="0" />
          </el-form-item>
          <el-form-item label="模式">
            <el-input v-model="localField.pattern" placeholder="正则表达式" />
          </el-form-item>
          <el-form-item label="格式">
            <el-select v-model="localField.format">
              <el-option label="无" value="" />
              <el-option label="日期" value="date" />
              <el-option label="日期时间" value="date-time" />
              <el-option label="邮箱" value="email" />
              <el-option label="主机名" value="hostname" />
              <el-option label="IPv4" value="ipv4" />
              <el-option label="IPv6" value="ipv6" />
              <el-option label="URI" value="uri" />
            </el-select>
          </el-form-item>
        </template>
        
        <!-- Number 类型设置 -->
        <template v-if="localField.type === 'number' || localField.type === 'integer'">
          <el-form-item label="最小值">
            <el-input-number v-model="localField.minimum" />
          </el-form-item>
          <el-form-item label="最大值">
            <el-input-number v-model="localField.maximum" />
          </el-form-item>
          <el-form-item label="倍数">
            <el-input-number v-model="localField.multipleOf" :min="0" :step="0.1" />
          </el-form-item>
          <el-form-item label="最小值">
            <el-switch v-model="localField.exclusiveMinimum" />
          </el-form-item>
          <el-form-item label="排除最大值">
            <el-switch v-model="localField.exclusiveMaximum" />
          </el-form-item>
        </template>
        
        <!-- Boolean 类型设置 -->
        <template v-if="localField.type === 'boolean'">
          <el-form-item label="默认值">
            <el-switch v-model="localField.default" />
          </el-form-item>
        </template>
        
        <!-- Object 类型设置 -->
        <template v-if="localField.type === 'object'">
          <el-form-item label="最小属性数">
            <el-input-number v-model="localField.minProperties" :min="0" />
          </el-form-item>
          <el-form-item label="最大属性数">
            <el-input-number v-model="localField.maxProperties" :min="0" />
          </el-form-item>
        </template>
        
        <!-- Array 类型设置 -->
        <template v-if="localField.type === 'array'">
          <el-form-item label="最小项数">
            <el-input-number v-model="localField.minItems" :min="0" />
          </el-form-item>
          <el-form-item label="最大项数">
            <el-input-number v-model="localField.maxItems" :min="0" />
          </el-form-item>
          <el-form-item label="唯一项">
            <el-switch v-model="localField.uniqueItems" />
          </el-form-item>
        </template>
        
        <!-- 通用设置 -->
        <el-form-item label="默认值">
          <el-input v-model="localField.default" />
        </el-form-item>
        <template v-if="localField.type === 'string' || localField.type === 'number' || localField.type === 'integer'">
          <el-form-item label="枚举值">
            <el-input
              type="textarea"
              v-model="enumValues"
              placeholder="每行输入一个枚举值"
              :rows="5"
            ></el-input>
          </el-form-item>
          <el-form-item label="枚举描述">
            <el-input
              type="textarea"
              v-model="enumDesc"
              placeholder="每行输入一个枚举描述，顺序与枚举值对应"
              :rows="5"
            ></el-input>
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAdvancedSettings = false">取消</el-button>
          <el-button type="primary" @click="saveAdvancedSettings">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits, nextTick } from 'vue'
import { ElRow, ElCol, ElInput, ElSelect, ElOption, ElButton, ElCheckbox, ElDialog, ElFormItem, ElTooltip } from 'element-plus'
import { Setting, Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  field: Object,
  fieldName: String,
  parent: Object,
  depth: {
    type: Number,
    default: 0
  },
  isArrayItem: {
    type: Boolean,
    default: false
  },
  required: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:field', 'update:fieldName', 'add-sibling', 'remove-field', 'update:required'])

const localField = ref(JSON.parse(JSON.stringify(props.field)))
const localFieldName = ref(props.fieldName || '')
const showAdvancedSettings = ref(false)

const types = ['string', 'number', 'boolean', 'object', 'array']

const isRequired = computed({
  get: () => Array.isArray(props.required) && props.required.includes(props.fieldName),
  set: (value) => emit('update:required', props.fieldName, value)
})

watch(() => props.field, (newValue) => {
  localField.value = JSON.parse(JSON.stringify(newValue))
}, { deep: true })

watch(() => props.fieldName, (newValue) => {
  localFieldName.value = newValue
})

const updateField = () => {
  emit('update:field', JSON.parse(JSON.stringify(localField.value)))
}

const updateFieldName = () => {
  if (!props.isArrayItem) {
    emit('update:fieldName', localFieldName.value)
  }
}

const handleTypeChange = (newType) => {
  if (newType === 'array' && !localField.value.items) {
    localField.value.items = {
      type: 'string'
    }
  } else if (newType !== 'array') {
    delete localField.value.items
  }

  if (newType === 'object' && !localField.value.properties) {
    localField.value.properties = {}
  } else if (newType !== 'object') {
    delete localField.value.properties
  }

  updateField()
}

const addSubField = () => {
  if (!localField.value.properties) {
    localField.value.properties = {}
  }
  const newField = {
    type: 'string',
    description: ''
  }
  const fieldName = 'newSubField' + Object.keys(localField.value.properties).length
  localField.value.properties[fieldName] = newField
  updateField()
}

const addSiblingToObject = (key) => {
  const newField = {
    type: 'string',
    description: ''
  }
  const fieldName = 'newSiblingField' + Object.keys(localField.value.properties).length
  localField.value.properties[fieldName] = newField
  updateField()
}

const removeSubField = (key) => {
  delete localField.value.properties[key]
  updateField()
}

const removeField = () => {
  emit('remove-field')
}

const updateSubField = (key, newValue) => {
  localField.value.properties[key] = newValue
  updateField()
}

const updateArrayItems = (newValue) => {
  localField.value.items = newValue
  updateField()
}

const getInputSpan = () => {
  const baseSpan = 15 // 加基础宽度，因为我们移除了描述输入框
  const reducedSpan = baseSpan - props.depth // 根据深度减少宽度
  return Math.max(reducedSpan, 5) // 确保最小宽度为 5
}

const updateRequired = (value) => {
  emit('update:required', props.fieldName, value)
}

const updateSubRequired = (fieldName, isRequired) => {
  if (!Array.isArray(localField.value.required)) {
    localField.value.required = []
  }
  if (isRequired) {
    if (!localField.value.required.includes(fieldName)) {
      localField.value.required.push(fieldName)
    }
  } else {
    localField.value.required = localField.value.required.filter(name => name !== fieldName)
  }
  updateField()
}

const updateSubFieldName = (oldKey, newKey) => {
  if (oldKey !== newKey) {
    const value = localField.value.properties[oldKey]
    delete localField.value.properties[oldKey]
    localField.value.properties[newKey] = value

    // 更新 required 数组
    if (localField.value.required) {
      const index = localField.value.required.indexOf(oldKey)
      if (index !== -1) {
        localField.value.required[index] = newKey
      }
    }

    updateField()
  }
}

const enumValues = ref('')
const enumDesc = ref('')

// 当打开高级设置对话框时，初始化枚举值和描述
watch(() => showAdvancedSettings.value, (newVal) => {
  if (newVal) {
    enumValues.value = localField.value.enum ? localField.value.enum.join('\n') : ''
    enumDesc.value = localField.value.enumDesc ? localField.value.enumDesc.join('\n') : ''
  }
})

const saveAdvancedSettings = () => {
  // 处理枚举值和描述
  if (enumValues.value.trim()) {
    localField.value.enum = enumValues.value.split('\n').map(v => v.trim()).filter(v => v)
    if (enumDesc.value.trim()) {
      localField.value.enumDesc = enumDesc.value.split('\n').map(v => v.trim())
    } else {
      delete localField.value.enumDesc
    }
  } else {
    delete localField.value.enum
    delete localField.value.enumDesc
  }

  updateField()
  showAdvancedSettings.value = false
}

</script>
<style scoped>
.schema-field {
  margin-top: 10px;
  margin-bottom: 10px;
}

.advanced-settings-form .el-form-item {
  margin-bottom: 22px;
}
.advanced-settings-form .el-form-item__content {
  display: flex;
  align-items: center;
}
.advanced-settings-form .el-select {
  width: 100%;
}
.advanced-settings-form .el-input-number {
  width: 100%;
}
</style>