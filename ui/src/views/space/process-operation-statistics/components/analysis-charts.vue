<template>
  <section class="panel analysis">
    <div class="panel-head">
      <h2>{{ t('分析') }}</h2>
      <span class="panel-sub">{{ t('按错误码执行者业务维度聚合失败实例数') }}</span>
    </div>
    <div class="charts">
      <div class="chart-card">
        <h3>{{ t('错误码分布') }}</h3>
        <PieChart :data="errorCodeData" />
      </div>
      <div class="chart-card">
        <h3>
          {{ t('错误数量人员分布') }}
          <span class="tip">Top3</span>
        </h3>
        <PieChart :data="creatorData" />
      </div>
      <div class="chart-card">
        <h3>
          {{ t('业务失败分布') }}
          <span class="tip">Top5</span>
        </h3>
        <PieChart :data="businessData" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import PieChart from './pie-chart.vue';
  import {
    BUSINESS_DATA,
    CREATOR_DATA,
    ERROR_CODE_DATA,
  } from '../../../../constants/process-operation-statistics';

  const { t } = useI18n();
  const errorCodeData = ERROR_CODE_DATA;
  const creatorData = CREATOR_DATA;
  const businessData = BUSINESS_DATA;
</script>

<style scoped lang="scss">
  .panel {
    background: #fff;
    border: 1px solid #e6eaf2;
    border-radius: 6px;
    padding: 18px 22px 20px;
    margin-bottom: 16px;
  }
  .panel-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 16px;
    h2 {
      position: relative;
      margin: 0;
      padding-left: 10px;
      font-size: 15px;
      font-weight: 600;
      color: #313238;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 2px;
        bottom: 2px;
        width: 3px;
        border-radius: 2px;
        background: #3a84ff;
      }
    }
    .panel-sub {
      font-size: 12px;
      color: #979ba5;
    }
  }
  .charts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .chart-card {
    border: 1px solid #e9edf5;
    border-radius: 6px;
    padding: 14px 16px 10px;
    h3 {
      margin: 0 0 6px;
      font-size: 13px;
      font-weight: 500;
      color: #313238;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tip {
      font-size: 11px;
      color: #3a84ff;
      background: #eef4ff;
      border-radius: 3px;
      padding: 1px 6px;
    }
  }
  @media (max-width: 1200px) {
    .charts {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 900px) {
    .charts {
      grid-template-columns: 1fr;
    }
  }
</style>
