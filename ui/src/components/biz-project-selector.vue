<template>
  <div class="biz-project-selector" ref="selectorRef">
    <!-- 触发器 -->
    <div class="selector-trigger" @click="togglePanel">
      <input readonly :value="displayText" :placeholder="t('请选择业务/项目')" />
      <AngleDown class="arrow-icon" :class="{ 'is-open': isOpen }" />
    </div>

    <!-- 下拉面板 -->
    <Transition name="panel-fade">
      <div v-if="isOpen" :class="['selector-panel', { 'single-column': !showProject }]">
        <!-- 主体：左右分栏 或 单栏 -->
        <div class="panel-body">
          <!-- 左侧：业务列表 -->
          <div :class="['panel-column', 'biz-column', { 'full-width': !showProject }]">
            <div class="column-search-wrapper">
              <div class="column-search">
                <Search class="search-icon" />
                <input
                  v-model="bizSearch"
                  type="text"
                  :placeholder="t('搜索业务')"
                  @click.stop />
              </div>
            </div>
            <div class="column-list">
              <RecycleScroller
                v-if="filteredBizList.length > 0"
                :items="filteredBizList"
                :item-size="36"
                key-field="space_id"
                class="virtual-scroller"
                v-slot="{ item }">
                <div
                  :class="['column-item', { active: selectedBizId === item.space_id }]"
                  @click="handleSelectBiz(item)">
                  <div class="name-wrapper">
                    <span class="name">{{ item.space_name }}</span>
                    <span class="id">({{ item.space_id }})</span>
                  </div>
                  <!-- 只有显示项目时才显示箭头 -->
                  <AngleRight v-if="showProject" class="arrow" />
                </div>
              </RecycleScroller>
              <div v-else class="column-empty">
                {{ t('暂无数据') }}
              </div>
            </div>
          </div>

          <!-- 右侧：项目列表（仅当 showProject=true 时显示） -->
          <div v-if="showProject" class="panel-column project-column">
            <div class="column-search-wrapper">
              <div class="column-search">
                <Search class="search-icon" />
                <input
                  v-model="projectSearch"
                  type="text"
                  :placeholder="t('搜索项目')"
                  @click.stop />
              </div>
            </div>
            <div class="column-list">
              <!-- Loading 状态 -->
              <div v-if="projectLoading" class="column-loading">
                <Loading class="loading-icon" />
                <span>{{ t('加载中...') }}</span>
              </div>
              <!-- 项目列表 -->
              <template v-else>
                <RecycleScroller
                  v-if="filteredProjectList.length > 0"
                  :items="filteredProjectList"
                  :item-size="36"
                  key-field="id"
                  class="virtual-scroller"
                  v-slot="{ item }">
                  <div
                    :class="['column-item', { active: selectedProjectId === item.id }]"
                    @click="handleSelectProject(item)">
                    <span class="item-name">{{ item.name }}</span>
                  </div>
                </RecycleScroller>
                <div v-else class="column-empty">
                  {{ currentBiz ? t('暂无项目') : t('请先选择业务') }}
                </div>
              </template>
            </div>
            <!-- 底部快捷入口 -->
            <div class="panel-footer">
              <div class="footer-item" @click="handleToProjectManage">
                <FolderOpen class="footer-icon" />
                <span>{{ t('项目管理') }}</span>
              </div>
              <div class="footer-divider"></div>
              <div class="footer-item" @click="handleToEnvManage">
                <CogShape class="footer-icon" />
                <span>{{ t('环境管理') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter, useRoute } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { AngleDown, AngleRight, Search, FolderOpen, CogShape, Loading } from 'bkui-vue/lib/icon';
  import { RecycleScroller } from 'vue-virtual-scroller';
  import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
  import useTemplateStore from '../store/template';
  import useGlobalStore from '../store/global';
  import { ISpaceDetail } from '../../types/index';
  import { getProjectList } from '../api/project';

  export interface IProjectItem {
    id: string;
    name: string;
  }

  export interface IBizItem {
    id: string;
    name: string;
    projectList?: IProjectItem[];
  }

  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const globalStore = useGlobalStore();
  const {
    spaceId,
    spaceList,
    showApplyPermDialog,
    permissionQuery } = storeToRefs(globalStore);
  const templateStore = useTemplateStore();

  const props = withDefaults(
    defineProps<{
      modelValue?: string[];
      separator?: string;
      showProject?: boolean;
      navList: any[];
    }>(),
    {
      modelValue: () => [],
      separator: ' / ',
      showProject: true,
    },
  );

  // eslint-disable-next-line func-call-spacing
  const emits = defineEmits<{
    (e: 'update:modelValue', value: string[]): void;
    (e: 'change', bizId: string, projectId: string, bizItem: IBizItem, projectItem?: IProjectItem | null): void;
  }>();

  const selectorRef = ref<HTMLElement>();
  const isOpen = ref(false);
  const selectedBizId = ref('');
  const selectedProjectId = ref('');
  const bizSearch = ref('');
  const projectSearch = ref('');

  // 缓存每个业务的项目列表，避免重复请求
  const bizProjectsMap = ref<Record<string, IProjectItem[]>>({});
  // 当前正在加载项目列表的业务ID
  const projectLoading = ref(false);

  const optionList = ref<ISpaceDetail[]>([]);

  watch(
    spaceList,
    (val) => {
      optionList.value = val.slice();
    },
    {
      immediate: true,
    },
  );

  // 左侧过滤后的业务列表
  const filteredBizList = computed(() => {
    if (!bizSearch.value) return optionList.value;
    const keyword = bizSearch.value.toLowerCase();
    return optionList.value.filter((biz) => {
      const spaceName = biz.space_name.toLowerCase();
      return spaceName.includes(keyword) || String(biz.space_id).includes(keyword);
    });
  });

  // 当前选中的业务
  const currentBiz = computed(() => optionList.value.find((b) => b.space_id === selectedBizId.value));

  // 右侧过滤后的项目列表
  const filteredProjectList = computed(() => {
    const list = selectedBizId.value ? (bizProjectsMap.value[selectedBizId.value] || []) : [];
    if (!projectSearch.value) return list;
    const keyword = projectSearch.value.toLowerCase();
    return list.filter((proj) => proj.name.toLowerCase().includes(keyword));
  });

  // 显示文本
  const displayText = computed(() => {
    if (!selectedBizId.value) {
      return '';
    }
    const biz = optionList.value.find((b) => b.space_id === selectedBizId.value);
    if (!biz) {
      return '';
    }
    // 如果不显示项目列，只显示业务名称
    if (!props.showProject) {
      return biz.space_name;
    }
    const projectList = bizProjectsMap.value[selectedBizId.value] || [];
    const project = projectList.find((p) => p.id === selectedProjectId.value);
    if (biz && project) {
      return `${biz.space_name}${props.separator}${project.name}`;
    }
    return biz?.space_name;
  });

  // 同步外部 modelValue
  watch(
    () => props.modelValue,
    (val) => {
      if (val && val.length >= 2) {
        selectedBizId.value = val[0];
        selectedProjectId.value = val[1];
      }
    },
    { immediate: true },
  );

  // 依据全局 spaceId 预选业务项（仅在外部 modelValue 未设置时生效）
  watchEffect(() => {
    const currentSpaceId = spaceId.value;
    if (
      currentSpaceId &&
      optionList.value.length > 0 &&
      (!props.modelValue || props.modelValue.length < 2)
    ) {
      const biz = optionList.value.find((b) => b.space_id === currentSpaceId);
      if (biz && selectedBizId.value !== currentSpaceId) {
        selectedBizId.value = currentSpaceId;
      }
    }
  });

  const togglePanel = () => {
    isOpen.value = !isOpen.value;
  };

  const closePanel = () => {
    isOpen.value = false;
  };

  const handleSelectSpace = async (id: string) => {
    const space = spaceList.value.find((item: ISpaceDetail) => item.space_id === id);
    if (space) {
      if (!space.permission) {
        permissionQuery.value = {
          resources: [
            {
              biz_id: id,
              basic: {
                type: 'biz',
                action: 'find_business_resource',
                resource_id: id,
              },
            },
          ],
        };

        showApplyPermDialog.value = true;
        return;
      }
      templateStore.$patch((state) => {
        state.templateSpaceList = [];
        state.currentTemplateSpace = 0;
        state.currentPkg = '';
      });
      const nav = props.navList.find((item) => item.module === route.meta.navModule);
      if (nav) {
        router.push({ name: nav.id, params: { spaceId: id } });
      } else {
        router.push({ name: 'service-all', params: { spaceId: id } });
      }
    }
  };

  const handleSelectBiz = async (biz: ISpaceDetail) => {
    selectedBizId.value = biz.space_id;
    handleSelectSpace(selectedBizId.value);
    // 如果不显示项目列，直接选中业务并关闭面板
    if (!props.showProject) {
      selectedProjectId.value = '';
      const value = [biz.space_id];
      // 构造 IBizItem 对象以匹配 emit 类型
      const bizItemForEmit: IBizItem = {
        id: biz.space_id,
        name: biz.space_name,
        projectList: [],
      };
      emits('update:modelValue', value);
      emits('change', biz.space_id, '', bizItemForEmit, null);
      closePanel();
      return;
    }

    // 显示项目列时的原有逻辑
    selectedProjectId.value = '';
    projectSearch.value = '';

    // 如果已缓存该项目列表，直接返回
    if (bizProjectsMap.value[biz.space_id]) {
      return;
    }

    // 异步获取项目列表
    projectLoading.value = true;
    try {
      const res = await getProjectList(biz.space_id, { all: true });
      const projects = res.data?.details || [];
      // 转换为 IProjectItem 格式
      bizProjectsMap.value[biz.space_id] = projects.map((proj: any) => ({
        id: String(proj.id),
        name: proj.name,
      }));
    } catch (e) {
      console.error('获取项目列表失败', e);
      bizProjectsMap.value[biz.space_id] = [];
    } finally {
      projectLoading.value = false;
    }
  };

  const handleSelectProject = (proj: IProjectItem) => {
    selectedProjectId.value = proj.id;
    const bizItem = currentBiz.value;
    if (bizItem) {
      const value = [bizItem.space_id, proj.id];
      // 构造 IBizItem 对象以匹配 emit 类型
      const bizItemForEmit: IBizItem = {
        id: bizItem.space_id,
        name: bizItem.space_name,
        projectList: bizProjectsMap.value[bizItem.space_id] || [],
      };
      emits('update:modelValue', value);
      emits('change', bizItem.space_id, proj.id, bizItemForEmit, proj);
    }
    closePanel();
  };

  const handleToProjectManage = () => {
    closePanel();
    router.push({ name: 'project-manage' });
  };

  const handleToEnvManage = () => {
    closePanel();
    router.push({ name: 'env-manage' });
  };

  // 点击外部关闭面板
  const handleClickOutside = (event: MouseEvent) => {
    if (selectorRef.value && !selectorRef.value.contains(event.target as Node)) {
      closePanel();
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<style lang="scss" scoped>
  .biz-project-selector {
    position: relative;
    width: 100%;
  }

  .selector-trigger {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;

    input {
      padding: 0 28px 0 10px;
      width: 100%;
      height: 32px;
      line-height: 32px;
      font-size: 12px;
      border: none;
      outline: none;
      background: #303d55;
      border-radius: 2px;
      color: #d3d9e4;
      cursor: pointer;

      &::placeholder {
        color: #979ba5;
      }
    }

    .arrow-icon {
      position: absolute;
      top: 50%;
      right: 6px;
      transform: translateY(-50%);
      font-size: 16px;
      color: #979ba5;
      transition: transform 0.2s ease;
      pointer-events: none;

      &.is-open {
        transform: translateY(-50%) rotate(-180deg);
      }
    }
  }

  .selector-panel {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    background: #182132;
    border-radius: 0 0 2px 2px;
    width: 414px;
    max-height: 260px;
    overflow: hidden;
    font-size: 12px;

    &.single-column {
      width: 240px;

      .panel-body {
        .biz-column.full-width {
          border-right: none;
        }
      }
    }
  }

  .panel-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .panel-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.biz-column {
      border-right: 1px solid #404A5C;
    }

    &.project-column {
      .panel-footer {
        flex-shrink: 0;
      }
    }
  }

  .column-search-wrapper {
    flex-shrink: 0;
    padding: 8px 12px 0;
  }

  .column-search {
    position: relative;
    .search-icon {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      color: #63656e;
      pointer-events: none;
    }

    input {
      width: 100%;
      height: 32px;
      padding-left: 24px;
      font-size: 12px;
      color: #c4c6cc;
      background: #182132;
      border-width: 0;
      border-bottom: 1px solid #2f3746;
      border-radius: 2px;
      outline: none;

      &::placeholder {
        color: #63656e;
      }

      &:focus {
        border-bottom-color: #3a84ff;
      }
    }
  }

  .column-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
    position: relative;

    .virtual-scroller {
      height: 100%;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(150, 162, 185, 0.3);
        border-radius: 2px;
      }
    }

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(150, 162, 185, 0.3);
      border-radius: 2px;
    }
  }

  .column-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 20px;
    color: #979ba5;
    font-size: 12px;

    .loading-icon {
      font-size: 16px;
      animation: loading-rotate 1s linear infinite;
    }
  }

  @keyframes loading-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .column-item {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 36px;
    font-size: 12px;
    color: #c4c6cc;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: #2f3746;
    }

    &.active {
      color: #3a84ff;
      background: #1a2a4a;

      .arrow {
        color: #3a84ff;
      }
    }

    .name-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .name {
        flex: 0 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .id {
        flex: 0 0 auto;
        margin-left: 4px;
        color: #979ba5;
      }
    }

    .arrow {
      flex-shrink: 0;
      margin-left: auto;
      font-size: 12px;
      color: #63656e;
    }
  }

  .column-empty {
    padding: 24px 16px;
    text-align: center;
    font-size: 12px;
    color: #63656e;
  }

  .panel-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 5px 16px 6px 16px;
    border-top: 1px solid #2F3847;
    background: #28354D;
    flex-shrink: 0;
  }

  .footer-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #c4c6cc;
    cursor: pointer;
    transition: color 0.15s ease;
    line-height: 20px;

    &:hover {
      color: #3a84ff;

      .footer-icon {
        color: #3a84ff;
      }
    }
  }

  .footer-icon {
    font-size: 16px;
    color: #C4C6CC;
    transition: color 0.15s ease;
  }

  .footer-divider {
    width: 1px;
    height: 16px;
    background: #404A5C;
    margin: 0 15px;
  }

  // 面板动画
  .panel-fade-enter-active,
  .panel-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .panel-fade-enter-from,
  .panel-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
