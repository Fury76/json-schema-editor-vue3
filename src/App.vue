<template>
  
  <div style="width: 1000px;">
    <JsonSchemaEditor :initialSchema="defaultSchema" />
  </div>
  
</template>

<script setup lang="ts">
import JsonSchemaEditor from './jsonSchemaEditor/jsonSchemaEditor.vue'

const defaultSchema = {
  type: 'object',
  properties: {},
  required: []
}

</script>
<style scoped>

</style>
