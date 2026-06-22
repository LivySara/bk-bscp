<template>
  <section class="project-manage-page">
    <div class="project-manage-title">{{ t('项目管理') }}</div>
    <div class="project-manage-content">
        <div class="operate-area">
          <div class="btns">
            <bk-button theme="primary" @click="handleCreateProject">
              <Plus class="button-icon" />
              {{ t('新增项目') }}
            </bk-button>
          </div>
          <div class="filter-actions">
            <SearchSelector
              ref="searchSelectorRef"
              class="search-input"
              :search-field="searchField"
              :user-field="['creator']"
              :placeholder="t('项目名称/项目描述/创建人')"
              @search="handleSearch" />
          </div>
        </div>
        <div class="table-wrapper">
          <bk-loading style="min-height: 300px" :loading="listLoading">
            <bk-table
              class="project-table"
              show-overflow-tooltip
              :border="['outer']"
              :data="tableData">
              <bk-table-column :label="t('项目名称')" :min-width="200">
                <template #default="{ row }">
                  <div class="project-name-cell">
                    <span class="name">{{ row.name }}</span>
                    <span class="code">{{ row.code }}</span>
                  </div>
                </template>
              </bk-table-column>
              <bk-table-column :label="t('项目描述')" prop="description" :min-width="200" />
              <bk-table-column :label="t('环境数')" prop="env_count" :align="'center'" :width="80" />
              <bk-table-column :label="t('服务点数')" prop="service_count" :align="'center'" :width="100" />
              <bk-table-column :label="t('创建人')" prop="creator" :width="120" />
              <bk-table-column :label="t('创建时间')" prop="created_at" :width="170" />
              <bk-table-column :label="t('操作')" :width="140" :show-overflow-tooltip="false">
                <template #default="{ row }">
                  <div class="action-btns">
                    <bk-button text theme="primary" @click="handleEditProject(row)">{{ t('编辑项目') }}</bk-button>
                    <bk-button text theme="primary" @click="handleDeleteProject(row)">{{ t('删除项目') }}</bk-button>
                  </div>
                </template>
              </bk-table-column>
              <template #empty>
                <tableEmpty :is-search-empty="isSearchEmpty" @clear="clearSearchInfo" />
              </template>
            </bk-table>
            <bk-pagination
              v-model="pagination.current"
              class="table-pagination"
              location="left"
              :limit="pagination.limit"
              :layout="['total', 'limit', 'list']"
              :count="pagination.count"
              @change="handlePageChange"
              @limit-change="handlePageLimitChange" />
          </bk-loading>
        </div>
    </div>

    <!-- 创建/编辑项目弹窗 -->
    <ProjectFormDialog
      v-model="isFormDialogShow"
      :editing-item="editingItem"
      @success="loadProjectList" />

  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, h } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Plus } from 'bkui-vue/lib/icon';
  import { storeToRefs } from 'pinia';
  import Message from 'bkui-vue/lib/message';
  import useGlobalStore from '../../../store/global';
  import useTablePagination from '../../../utils/hooks/use-table-pagination';
  import tableEmpty from '../../../components/table/table-empty.vue';
  import ProjectFormDialog from './components/project-form-dialog.vue';
  import SearchSelector from '../../../components/search-selector.vue';
  import { InfoBox } from 'bkui-vue';
  import { deleteProject } from '../../../api/project';
  import type { IProjectItem } from '../../../../types/project';

  const { t } = useI18n();
  const { spaceId } = storeToRefs(useGlobalStore());
  const { pagination, updatePagination } = useTablePagination('projectList');

  const listLoading = ref(false);
  const tableData = ref<IProjectItem[]>([]);
  const isSearchEmpty = ref(false);
  const isFormDialogShow = ref(false);
  const editingItem = ref<Partial<IProjectItem>>({});
  const searchSelectorRef = ref();
  const searchField = [
    { field: 'name', label: t('项目名称') },
    { field: 'memo', label: t('项目描述') },
    { field: 'creator', label: t('创建人') },
  ];

  // 模拟数据
  const mockData: IProjectItem[] = [
    {
      id: 1,
      name: '默认项目',
      code: 'default-project',
      description: '这是默认项目的描述信息',
      env_count: 3,
      service_count: 5,
      creator: 'admin',
      created_at: '2026-06-10 10:00:00',
    },
    {
      id: 2,
      name: '测试项目',
      code: 'test-project',
      description: '这是测试项目的描述信息',
      env_count: 2,
      service_count: 1,
      creator: 'admin',
      created_at: '2026-06-15 14:30:00',
    },
  ];

  watch(
    () => spaceId.value,
    async () => {
      pagination.value.current = 1;
      await loadProjectList();
    },
  );

  onMounted(() => {
    loadProjectList();
  });

  // 加载项目列表（模拟数据）
  const loadProjectList = async () => {
    try {
      listLoading.value = true;
      // TODO: 接口就绪后替换为真实 API 调用
      // const start = pagination.value.limit * (pagination.value.current - 1);
      // const res = await getProjectList(spaceId.value, {
      //   start,
      //   limit: pagination.value.limit,
      // });
      // tableData.value = res.details || [];
      // pagination.value.count = res.count || 0;

      // 模拟异步请求
      await new Promise((resolve) => setTimeout(resolve, 300));
      tableData.value = mockData;
      pagination.value.count = mockData.length;
    } catch (e) {
      console.error(e);
    } finally {
      listLoading.value = false;
    }
  };

  // 搜索
  const handleSearch = (searchConditions: { [key: string]: string }) => {
    pagination.value.current = 1;
    isSearchEmpty.value = Object.keys(searchConditions).length > 0;
    if (Object.keys(searchConditions).length === 0) {
      tableData.value = mockData;
      return;
    }
    tableData.value = mockData.filter((item) => {
      // 所有指定条件均需匹配（AND 逻辑）
      for (const [field, keyword] of Object.entries(searchConditions)) {
        if (!keyword) continue;
        const lowerKeyword = keyword.toLowerCase();
        let fieldValue = '';
        if (field === 'name') {
          fieldValue = item.name;
        } else if (field === 'description') {
          fieldValue = item.description || '';
        } else if (field === 'creator') {
          fieldValue = item.creator || '';
        }
        if (!fieldValue.toLowerCase().includes(lowerKeyword)) {
          return false;
        }
      }
      return true;
    });
  };

  const clearSearchInfo = () => {
    searchSelectorRef.value?.clear();
  };

  // 创建项目
  const handleCreateProject = () => {
    editingItem.value = {};
    isFormDialogShow.value = true;
  };

  // 编辑项目
  const handleEditProject = (row: IProjectItem) => {
    editingItem.value = { ...row };
    isFormDialogShow.value = true;
  };

  // 删除项目
  const handleDeleteProject = (row: IProjectItem) => {
    InfoBox({
      title: t('确认删除该项目？'),
      subTitle: () => (
        h('div', [
          h('div', { class: 'pro-delete-title' }, `${t('项目名称')}：${row.name}`),
          h('div', { class: 'pro-delete-tip' }, t('删除该项目后将无法恢复，请谨慎操作')),
        ])
      ),
      'ext-cls': 'pro-info-box',
      confirmText: t('删除'),
      cancelText: t('取消'),
      onConfirm: async () => {
        try {
          await deleteProject(spaceId.value, row.id);
          Message({ theme: 'success', message: t('删除项目成功') });
          if (tableData.value.length === 1 && pagination.value.current > 1) {
            pagination.value.current -= 1;
          }
          loadProjectList();
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  const handlePageChange = (val: number) => {
    pagination.value.current = val;
    loadProjectList();
  };

  const handlePageLimitChange = (val: number) => {
    updatePagination('limit', val);
    loadProjectList();
  };
</script>

<style lang="scss" scoped>
  .project-manage-page {
    background: #f5f7fa;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .project-manage-title {
    padding: 14px 24px;
    height: 52px;
    background-color: #fff;
    line-height: 24px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px #0D191929;
  }

  .project-manage-content {
    padding: 24px;
  }

  .operate-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .button-icon {
      font-size: 18px;
    }
  }

  .search-input {
    width: 320px;
    background-color: #fff;
  }

  .project-name-cell {
    .name {
      color: #313238;
    }
    .code {
      margin-left: 12px;
      color: #979ba5;
      font-size: 12px;
    }
  }

  .action-btns {
    .bk-button:not(:last-child) {
      margin-right: 8px;
    }
  }

  .table-pagination {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid #dcdee5;
    border-top: none;
    border-radius: 0 0 2px 2px;
    background: #ffffff;

    :deep(.bk-pagination-list.is-last) {
      margin-left: auto;
    }
  }
</style>
<style lang="scss">
  .pro-info-box {
    .bk-modal-footer {
      padding: 0 32px 24px !important;
      height: 56px !important;
    }
    .bk-dialog-footer{
      .bk-button.bk-button-primary {
        background-color: #ea3636;
        border-color: #ea3636;
        &:hover {
          background-color: #ff5656;
          border-color: #ff5656;
        }
      }
    }
    .bk-dialog-header {
        padding: 24px 32px 0 !important;
        .bk-dialog-title {
            margin: 16px 0 20px 0 !important;
        }
    }
    .bk-modal-content {
        padding: 0 32px 24px !important;
    }
    .bk-info-sub-title {
        text-align: left !important;
        line-height: 22px;
    }
    .pro-delete-title {
      font-size: 14px;
      color: #313238;
      margin-bottom: 16px;
    }
    .pro-delete-tip {
      font-size: 14px;
      color: #4D4F56;
      background-color: #F5F7FA;
      padding: 12px 16px;
    }
  }
</style>
