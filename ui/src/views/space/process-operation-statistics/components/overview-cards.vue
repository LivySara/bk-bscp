<template>
  <section class="panel overview">
    <div class="panel-head">
      <h2>{{ t('概览') }}</h2>
      <span class="panel-sub">{{ scopeText }}</span>
    </div>
    <div class="cards">
      <div v-for="card in cards" :key="card.title" :class="['card', card.tone]">
        <div class="card-title">{{ card.title }}</div>
        <div class="card-value">{{ formatNumber(card.value) }}</div>
        <div class="card-sub">{{ card.sub }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { OVERVIEW_CARDS } from '../../../../constants/process-operation-statistics';

  defineProps<{
    scopeText: string;
  }>();

  const { t } = useI18n();
  const cards = OVERVIEW_CARDS;

  const formatNumber = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .card {
    position: relative;
    background: #fbfcfe;
    border: 1px solid #e9edf5;
    border-radius: 6px;
    padding: 18px 20px 16px;
    text-align: center;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 16px;
      bottom: 16px;
      width: 3px;
      border-radius: 0 2px 2px 0;
      background: #3a84ff;
    }
    &.warn::before {
      background: #ea3636;
    }
    &.muted::before {
      background: #9aa5b8;
    }
    .card-title {
      font-size: 13px;
      color: #63656e;
    }
    .card-value {
      font-size: 34px;
      font-weight: 600;
      line-height: 1.5;
      color: #313238;
    }
    &.warn .card-value {
      color: #ea3636;
    }
    .card-sub {
      font-size: 12px;
      color: #979ba5;
    }
  }
  @media (max-width: 900px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }
</style>
