<template>
  <section class="process-operation-statistics-page">
    <GlobalFilter @change="handleFilterChange" @org-change="handleOrgChange" />
    <AnalysisCharts />
    <OverviewCards :scope-text="scopeText" />
    <DetailTable />
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import GlobalFilter from './components/global-filter.vue';
  import AnalysisCharts from './components/analysis-charts.vue';
  import OverviewCards from './components/overview-cards.vue';
  import DetailTable from './components/detail-table.vue';

  const { t } = useI18n();
  const timeRange = ref<string[]>([]);
  const orgNames = ref<string[]>([]);
  const scopeText = ref('');

  const updateScopeText = () => {
    const orgText = orgNames.value.length ? orgNames.value.join('、') : t('全部组织架构');
    scopeText.value = `${t('统计范围')} ${timeRange.value.join(' ~ ')} · ${orgText} · ${t('全部执行者')} · ${t(
      '全部操作类型最终执行结果',
    )}`;
  };

  const handleFilterChange = (value: unknown) => {
    timeRange.value = Array.isArray(value) ? value : [];
    updateScopeText();
  };

  const handleOrgChange = (names: string[]) => {
    orgNames.value = names;
    updateScopeText();
  };
</script>

<style scoped lang="scss">
  .process-operation-statistics-page {
    height: 100%;
    padding: 24px;
    background: #f5f7fa;
    overflow: auto;
  }
</style>
