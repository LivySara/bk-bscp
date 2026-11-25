<template>
  <DatePicker
    v-model="timeRange"
    :common-use-list="commonUseList"
    :need-timezone="false"
    :enable-format-click="false"
    default-format="YYYY-MM-DD HH:mm:ss"
    @update:model-value="handleChange" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import DatePicker, { type DateValue } from '@blueking/date-picker';
  import '@blueking/date-picker/vue3/vue3.css';

  const emits = defineEmits(['change']);

  const timeRange = ref<DateValue>(['now-7d/d', 'now']);
  const commonUseList = ref<DateValue[]>([
    ['now/d', 'now/d'],
    ['now-1d/d', 'now-1d/d'],
    ['now-7d/d', 'now'],
    ['now/d', 'now'],
    ['now-30d/d', 'now'],
  ]);

  const handleChange = (value: DateValue) => {
    emits('change', value);
  };
</script>

<style scoped lang="scss">
  :deep(.bk-date-picker) {
    width: 240px;
  }
</style>
