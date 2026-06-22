<template>
  <section class="env-manage-page">
    <div class="env-manage-title">{{ t('环境管理') }}</div>
    <div class="env-manage-content">
        <div class="operate-area">
          <div class="btns">
            <bk-button theme="primary" @click="handleCreateEnv">
              <Plus class="button-icon" />
              {{ t('新增环境') }}
            </bk-button>
          </div>
          <div class="filter-actions">
            <SearchSelector
              class="search-input"
              :search-field="searchField"
              :user-field="['creator']"
              :placeholder="t('环境名称/环境描述/创建人')"
              @search="handleSearch" />
          </div>
        </div>
        <bk-loading :loading="listLoading">
          <div class="env-group-list">
            <div
              v-for="group in envGroupList"
              :key="group.type"
              class="env-group">
              <div
                 class="env-group-header"
                 :style="{
                   backgroundColor: group.bgColor || '#F5F7FA',
                   color: group.textColor || '#63656E',
                 }">
                 <i
                  :class="`bk-bscp-icon ${group.iconClass || ''} type-icon`"
                  :style="{ color: group.iconColor || '#979BA5' }"></i>
                 <span class="type-name">{{ group.name }}</span>
              </div>
              <div class="env-group-body">
                <!-- 有环境数据 -->
                <template v-if="group.items.length > 0">
                  <div
                      class="env-card-wrapper"
                      v-for="item in group.items"
                      :key="item.id">
                    <div class="env-card">
                      <div class="card-header">
                        <div class="header-left">
                          <span class="env-name">{{ item.name }}</span>
                          <span class="service-count">{{ t('共N个服务', { count: item.service_count }) }}</span>
                        </div>
                        <div class="action-btns">
                          <bk-button text theme="primary" @click="handleEditEnv(item)">{{ t('编辑环境') }}</bk-button>
                          <bk-button text theme="primary" @click="handleDeleteEnv(item)">{{ t('删除环境') }}</bk-button>
                        </div>
                      </div>
                      <div class="card-mid">
                        <div class="card-desc" v-overflow-title >{{ item.description }}</div>
                        <div class="card-meta">
                            <i class="bk-bscp-icon icon-yonghu-2 meta-icon"></i>
                            {{ item.creator }}
                            <i class="bk-bscp-icon icon-time-2 meta-icon"></i>
                            {{ item.created_at }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 空状态 -->
                <div v-else class="env-empty">
                  <img src="../../../assets/images/empty.png" alt="" class="empty-img" />
                  <p class="empty-text">{{ t('暂无N', { type: group.name }) }}</p>
                </div>
              </div>
            </div>
          </div>
        </bk-loading>
    </div>

    <!-- 创建/编辑环境弹窗 -->
    <EnvFormDialog
      v-model="isFormDialogShow"
      :editing-item="editingItem"
      @success="loadEnvList" />
  </section>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, h } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Plus } from 'bkui-vue/lib/icon';
  import { storeToRefs } from 'pinia';
  import Message from 'bkui-vue/lib/message';
  import { InfoBox } from 'bkui-vue';
  import useGlobalStore from '../../../store/global';
  import EnvFormDialog from './components/env-form-dialog.vue';
  import SearchSelector from '../../../components/search-selector.vue';
  // import { getEnvList, deleteEnv } from '../../../api/env';
  import { IEnvItem, EnvType } from '../../../../types/env';
  import { ENV_TYPE_OPTIONS } from '../../../constants/env';

  const { t } = useI18n();
  const { spaceId } = storeToRefs(useGlobalStore());

  const listLoading = ref(false);
  const allEnvList = ref<IEnvItem[]>([]);
  const isSearchEmpty = ref(false);
  const isFormDialogShow = ref(false);
  const editingItem = ref<Partial<IEnvItem>>({});
  const searchField = [
    { field: 'name', label: t('环境名称') },
    { field: 'memo', label: t('环境描述') },
    { field: 'creator', label: t('创建人') },
  ];

  // 按类型分组的环境列表
  const envGroupList = computed(() => {
    return ENV_TYPE_OPTIONS.map((config) => ({
      ...config,
      items: allEnvList.value.filter((env) => env.type === config.type),
    }));
  });

  // 模拟数据
  const mockData: IEnvItem[] = [
    {
      id: 1,
      name: 'Default',
      code: 'default',
      type: EnvType.PRODUCTION,
      description: '默认生产环境默认生产环境默认生产环境默认生产环境默认生产环境默认生产环境默认生产环境默认生产环境默认生产环境默认生产环境',
      service_count: 3,
      creator: 'admin',
      created_at: '2026-06-06 12:12:13',
    },
    {
      id: 2,
      name: 'Prod',
      code: 'prod',
      type: EnvType.PRODUCTION,
      description: '项目正式的生产环境',
      service_count: 10,
      creator: 'admin',
      created_at: '2026-06-06 12:12:17',
    },
    {
      id: 3,
      name: 'Staging',
      code: 'staging',
      type: EnvType.STAGING,
      description: '默认生产环境',
      service_count: 3,
      creator: 'admin',
      created_at: '2026-06-06 12:12:12',
    },
    {
      id: 4,
      name: 'test1',
      code: 'test1',
      type: EnvType.TESTING,
      description: 'ceshi',
      service_count: 3,
      creator: 'admin',
      created_at: '2026-06-06 12:12:12',
    },
    {
      id: 5,
      name: 'test2',
      code: 'test2',
      type: EnvType.TESTING,
      description: '测试环境2',
      service_count: 3,
      creator: 'admin',
      created_at: '2026-06-06 12:12:15',
    },
    {
      id: 6,
      name: 'test3',
      code: 'test3',
      type: EnvType.TESTING,
      description: '测试',
      service_count: 3,
      creator: 'admin',
      created_at: '2026-06-06 12:12:12',
    },
  ];

  watch(
    () => spaceId.value,
    async () => {
      await loadEnvList();
    },
  );

  onMounted(() => {
    loadEnvList();
  });

  // 加载环境列表（模拟数据）
  const loadEnvList = async () => {
    try {
      listLoading.value = true;
      // TODO: 接口就绪后替换为真实 API 调用
      // const res = await getEnvList(spaceId.value, { start: 0, limit: 100 });
      // allEnvList.value = res.details || [];
      await new Promise((resolve) => setTimeout(resolve, 300));
      allEnvList.value = mockData;
    } catch (e) {
      console.error(e);
    } finally {
      listLoading.value = false;
    }
  };

  // 搜索
  const handleSearch = (searchConditions: { [key: string]: string }) => {
    isSearchEmpty.value = Object.keys(searchConditions).length > 0;
    if (Object.keys(searchConditions).length === 0) {
      allEnvList.value = mockData;
      return;
    }
    allEnvList.value = mockData.filter((item) => {
      // 所有指定条件均需匹配（AND 逻辑）
      for (const [field, keyword] of Object.entries(searchConditions)) {
        if (!keyword) continue;
        const lowerKeyword = keyword.toLowerCase();
        let fieldValue = '';
        if (field === 'name') {
          fieldValue = item.name;
        } else if (field === 'memo') {
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

  // 创建环境
  const handleCreateEnv = () => {
    editingItem.value = {};
    isFormDialogShow.value = true;
  };

  // 编辑环境
  const handleEditEnv = (row: IEnvItem) => {
    editingItem.value = { ...row };
    isFormDialogShow.value = true;
  };

  // 删除环境
  const handleDeleteEnv = (row: IEnvItem) => {
    InfoBox({
      title: t('确认删除该环境？'),
      subTitle: () => (
        h('div', [
          h('div', { class: 'env-delete-title' }, `${t('环境名称')}：${row.name}`),
          h('div', { class: 'env-delete-tip' }, t('一旦删除该环境操作将无法撤销请谨慎操作')),
        ])
      ),
      'ext-cls': 'env-info-box',
      confirmText: t('删除'),
      cancelText: t('取消'),
      onConfirm: async () => {
        try {
          // TODO: 接口就绪后替换
          // await deleteEnv(spaceId.value, row.id);
          Message({ theme: 'success', message: t('删除环境成功') });
          allEnvList.value = allEnvList.value.filter((item) => item.id !== row.id);
        } catch (e) {
          console.error(e);
        }
      },
    });
  };
</script>

<style lang="scss" scoped>
  .env-manage-page {
    background: #f5f7fa;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .env-manage-title {
    padding: 14px 24px;
    height: 52px;
    background-color: #fff;
    line-height: 24px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px #0D191929;
  }

  .env-manage-content {
    padding: 24px 200px;
    flex: 1;
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 0;
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

  .env-group-list {
    height: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 24px;
    min-height: 0;
  }

  .env-group {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 4px;
    border-radius: 4px;
    box-shadow: 0 2px 4px #0D191929;
    background-color: #fff;
    overflow: hidden;
  }

  .env-group-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 16px;
    margin-bottom: 16px;

    .type-icon {
      font-size: 20px;
    }

    .type-name {
      font-size: 14px;
      font-weight: 700;
      line-height: 22px;
    }
  }

  .env-group-body {
    flex: 1;
    height: 0;
    overflow-y: auto;
    min-height: 0;
  }

  .env-card-wrapper {
    padding: 0 24px 8px;
  }

  .env-card {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    border-bottom: 1px solid #DCDEE5;
    color: #979BA5;
    line-height: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    .header-left {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .env-name {
      font-weight: 600;
      font-size: 14px;
      color: #313238;
    }

    .service-count {
      padding: 0 8px;
      font-size: 12px;
      color: #979ba5;
      background-color: #F0F1F5;
      border-radius: 2px;
    }

    .action-btns {
      .bk-button {
        margin-left: 16px;
      }
    }
  }

  .card-mid {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    .card-desc {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .card-meta {
      display: flex;
      align-items: center;
      .meta-icon {
        font-size: 16px;
        margin-left: 16px;
        margin-right: 4px;
      }
    }
  }

  .env-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;

    .empty-img {
      width: 80px;
      height: auto;
      opacity: 0.6;
    }

    .empty-text {
      margin-top: 12px;
      font-size: 12px;
      color: #979ba5;
    }
  }
</style>
<style lang="scss">
  .env-info-box {
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
    .env-delete-title {
      font-size: 14px;
      color: #313238;
      margin-bottom: 16px;
    }
    .env-delete-tip {
      font-size: 14px;
      color: #4D4F56;
      background-color: #F5F7FA;
      padding: 12px 16px;
    }
  }
</style>
