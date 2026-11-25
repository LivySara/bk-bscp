<template>
  <section class="panel global-filter">
    <div class="filter-row">
      <div class="field">
        <label>{{ t('时间范围') }}</label>
        <DateRangePicker @change="handleTimeChange" />
      </div>
      <div class="field">
        <label>
          {{ t('组织架构') }}
          <span class="hint">{{ t('为空代表全部组织') }}</span>
        </label>
        <BkOrgSelector
          v-model="selectedOrgs"
          :api-base-url="api"
          tenant-id="default"
          :has-user="true"
          display-mode="path"
          display-width="240px"
          @change="handleOrgChange" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import BkOrgSelector from '@blueking/bk-org-selector';
  import type { TreeItem } from '@blueking/bk-org-selector';
  import '@blueking/bk-org-selector/vue3/vue3.css';
  import { onBeforeMount, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import DateRangePicker from './date-range-picker.vue';

  const { t } = useI18n();
  const emits = defineEmits(['change', 'org-change']);

  const api = ref('');
  const selectedOrgs = ref<TreeItem[]>([]);

  onBeforeMount(() => {
    api.value = `${(window as any).USER_MAN_HOST}`;
  });

  const handleTimeChange = (value: unknown) => {
    emits('change', value);
  };

  const handleOrgChange = (value: TreeItem[]) => {
    selectedOrgs.value = value;
    emits(
      'org-change',
      value.map((item) => item.display_name || item.name || String(item.id)),
    );
  };
</script>

<style scoped lang="scss">
  .global-filter {
    background: #fff;
    border: 1px solid #e6eaf2;
    border-radius: 6px;
    padding: 18px 22px 20px;
    margin-bottom: 16px;
  }
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 20px 24px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    label {
      font-size: 12px;
      color: #5b6577;
    }
    .hint {
      font-size: 12px;
      color: #9aa5b8;
    }
    :deep(.bk-input) {
      width: 240px;
    }
  }
</style>
