<template>
  <section class="panel detail">
    <div class="panel-head">
      <h2>{{ t('明细') }}</h2>
      <span class="panel-sub">{{ t('失败实例列表与概览同口径') }}</span>
    </div>
    <div class="filters">
      <div class="field">
        <label>{{ t('执行状态') }}</label>
        <bk-select v-model="filter.status" :clearable="false">
          <bk-option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
            :label="option.label" />
        </bk-select>
      </div>
      <div class="field">
        <label>{{ t('操作人') }}</label>
        <bk-select v-model="filter.creator" :clearable="false">
          <bk-option value="">{{ t('全部') }}</bk-option>
          <bk-option v-for="name in creatorOptions" :key="name" :value="name" :label="name" />
        </bk-select>
      </div>
      <div class="field">
        <label>{{ t('错误码') }}</label>
        <bk-select v-model="filter.errorCode" :clearable="false">
          <bk-option
            v-for="option in errorCodeOptions"
            :key="option.value"
            :value="option.value"
            :label="option.label" />
        </bk-select>
      </div>
      <div class="actions">
        <bk-button theme="primary" @click="handleQuery">{{ t('查询') }}</bk-button>
        <bk-button @click="handleReset">{{ t('重置') }}</bk-button>
      </div>
    </div>

    <bk-table :data="pagedRows" :border="['outer']" :max-height="420">
      <bk-table-column :label="t('任务ID')" prop="taskId" width="220" show-overflow-tooltip />
      <bk-table-column label="created_by" prop="creator" width="110" />
      <bk-table-column :label="t('进程实例ID')" prop="processInstanceId" width="130" />
      <bk-table-column :label="t('执行状态')" width="100">
        <template #default="{ row }">
          <bk-tag :theme="statusThemeMap[row.status as TaskStatus]">
            {{ statusMap[row.status as TaskStatus] }}
          </bk-tag>
        </template>
      </bk-table-column>
      <bk-table-column :label="t('开始时间')" prop="startTime" width="180" />
      <bk-table-column :label="t('结束时间')" prop="endTime" width="180" />
      <bk-table-column :label="t('错误码')" width="110">
        <template #default="{ row }">{{ row.errorCode ?? '--' }}</template>
      </bk-table-column>
      <bk-table-column :label="t('失败原因')" min-width="240">
        <template #default="{ row }">
          <span class="reason" v-bk-tooltips="{ content: row.failedReason, placement: 'top' }">
            {{ row.failedReason }}
          </span>
        </template>
      </bk-table-column>
      <template #empty>
        <div class="empty">{{ t('暂无数据') }}</div>
      </template>
    </bk-table>

    <div class="pager">
      <span>{{ t('共n条', { n: filteredRows.length }) }}</span>
      <span>{{ t('第n_m页', { n: currentPage, m: totalPages }) }}</span>
      <bk-button size="small" :disabled="currentPage <= 1" @click="handlePageChange(currentPage - 1)">
        {{ t('上一页') }}
      </bk-button>
      <bk-button size="small" :disabled="currentPage >= totalPages" @click="handlePageChange(currentPage + 1)">
        {{ t('下一页') }}
      </bk-button>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    CREATOR_OPTIONS,
    DEFAULT_DETAIL_FILTER,
    DETAIL_ROWS,
    ERROR_CODE_OPTIONS,
    STATUS_MAP,
    STATUS_OPTIONS,
    STATUS_THEME_MAP,
  } from '../../../../constants/process-operation-statistics';
  import type { IDetailFilter, TaskStatus } from '../../../../types/process-operation-statistics';

  const { t } = useI18n();

  const filter = ref<IDetailFilter>({ ...DEFAULT_DETAIL_FILTER });
  const appliedFilter = ref<IDetailFilter>({ ...DEFAULT_DETAIL_FILTER });
  const currentPage = ref(1);
  const pageSize = 10;

  const statusMap = STATUS_MAP;
  const statusThemeMap = STATUS_THEME_MAP;
  const statusOptions = STATUS_OPTIONS;
  const creatorOptions = CREATOR_OPTIONS;
  const errorCodeOptions = ERROR_CODE_OPTIONS;

  const filteredRows = computed(() =>
    DETAIL_ROWS.filter((row) => {
      const { status, creator, errorCode } = appliedFilter.value;
      if (status && row.status !== status) return false;
      if (creator && row.creator !== creator) return false;
      if (errorCode === '0' && row.errorCode !== null) return false;
      if (errorCode && errorCode !== '0' && String(row.errorCode) !== errorCode) return false;
      return true;
    }),
  );

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)));
  const pagedRows = computed(() =>
    filteredRows.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize),
  );

  const handleQuery = () => {
    appliedFilter.value = { ...filter.value };
    currentPage.value = 1;
  };

  const handleReset = () => {
    filter.value = { ...DEFAULT_DETAIL_FILTER };
    appliedFilter.value = { ...DEFAULT_DETAIL_FILTER };
    currentPage.value = 1;
  };

  const handlePageChange = (page: number) => {
    currentPage.value = page;
  };
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
  .filters {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 12px 16px;
    padding: 12px 14px;
    background: #f8fafd;
    border: 1px solid #eef1f7;
    border-radius: 6px;
    margin-bottom: 14px;
    .field {
      display: flex;
      flex-direction: column;
      gap: 5px;
      label {
        font-size: 12px;
        color: #7b8598;
      }
      :deep(.bk-select) {
        width: 160px;
      }
    }
    .actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
  }
  .reason {
    display: inline-block;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .empty {
    padding: 44px 0;
    text-align: center;
    color: #979ba5;
    font-size: 13px;
  }
  .pager {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 14px;
    font-size: 12px;
    color: #7b8598;
  }
</style>
