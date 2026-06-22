<template>
  <bk-dialog
    v-model:is-show="localVisible"
    :title="isEdit ? t('编辑环境') : t('新建环境')"
    width="480"
    @closed="handleClosed">
    <bk-form ref="formRef" form-type="vertical" :model="formData" :rules="formRules">
      <bk-form-item :label="t('环境类型')" property="type" required>
        <div class="type-selector">
          <div class="option-line-wapper" v-for="(item, index) in ENV_TYPE_OPTIONS" :key="item.type">
            <div
              class="type-option"
              :class="{ active: formData.type === item.type }"
              @click="formData.type = item.type">
              <i
               :class="`
                bk-bscp-icon ${item.iconClass} type-icon
              `"
               :style="{ color: item.iconColor || '#979BA5' }">
              </i>
              <span class="type-label">{{ item.name }}</span>
            </div>
            <div v-if="index !== ENV_TYPE_OPTIONS.length - 1 && formData.type !== item.type" class="item-divider"></div>
        </div>
        </div>
      </bk-form-item>
      <bk-form-item :label="t('环境名称')" property="name" required>
        <bk-input v-model="formData.name" :placeholder="t('请输入环境名称')" :maxlength="32" />
      </bk-form-item>
      <bk-form-item :label="t('环境描述')" property="memo" required>
        <bk-input
          v-model="formData.memo"
          type="textarea"
          :placeholder="t('请输入环境描述')"
          :rows="3" />
      </bk-form-item>
    </bk-form>
    <template #footer>
      <div class="dialog-footer">
        <bk-button theme="primary" :loading="submitLoading" @click="handleSubmit">
          {{isEdit ? t('保存') : t('提交') }}
        </bk-button>
        <bk-button @click="handleCancel">{{ t('取消') }}</bk-button>
      </div>
    </template>
  </bk-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Message from 'bkui-vue/lib/message';
  import type { IEnvItem, EnvType } from '../../../../../types/env';
  import { ENV_TYPE_OPTIONS } from '../../../../constants/env';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue: boolean;
    editingItem: Partial<IEnvItem>;
  }>();

  // eslint-disable-next-line func-call-spacing
  const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void;
    (e: 'success'): void;
  }>();

  const localVisible = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
  });

  const isEdit = computed(() => !!props.editingItem.id);

  const formRef = ref();
  const submitLoading = ref(false);
  const formData = reactive({
    name: '',
    type: 'prod' as string | EnvType,
    memo: '',
  });

  const formRules = {
    type: [
      {
        required: true,
        message: () => t('请选择环境类型'),
        trigger: 'change',
      },
    ],
    name: [
      {
        required: true,
        message: () => t('请输入环境名称'),
        trigger: 'blur',
      },
    ],
    memo: [
      {
        required: true,
        message: () => t('请输入环境描述'),
        trigger: 'blur',
      },
    ],
  };

  watch(
    () => props.editingItem,
    (val) => {
      if (val.id) {
        Object.assign(formData, {
          name: val.name || '',
          type: val.type || '',
          description: val.description || '',
        });
      } else {
        Object.assign(formData, { name: '', type: 'prod', description: '' });
      }
    },
    { immediate: true },
  );

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate();
      submitLoading.value = true;
      console.log(formData, '环境');
      if (isEdit.value) {
        // TODO: 接口就绪后替换
        // await updateEnv(spaceId.value, props.editingItem.id!, formData);
        Message({ theme: 'success', message: t('编辑环境成功') });
      } else {
        // TODO: 接口就绪后替换
        // await createEnv(spaceId.value, formData);
        Message({ theme: 'success', message: t('创建环境成功') });
      }
      localVisible.value = false;
      emit('success');
    } catch {
      // 校验失败或接口报错，不关闭弹窗
    } finally {
      submitLoading.value = false;
    }
  };

  const handleCancel = () => {
    localVisible.value = false;
  };

  const handleClosed = () => {
    Object.assign(formData, { name: '', type: '', description: '' });
    submitLoading.value = false;
  };
</script>

<style lang="scss" scoped>
  .type-selector {
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 2px;
    background-color: #F0F1F5;
    color: #4D4F56;
    .option-line-wapper {
        flex: 1;
        display: flex;
        align-items: center;
    }
    .type-option {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 12px;
      cursor: pointer;
      color: #63656e;
      transition: all 0.2s;
      line-height: 20px;
      &:hover {
        color: #3a84ff;
      }

      &.active {
        border-radius: 2px;
        color: #3a84ff;
        background: #fff;
        margin-left: -1px;
      }

      .type-icon {
        font-size: 14px;
      }

      .type-label {
        font-size: 12px;
        white-space: nowrap;
      }
    }
    .item-divider {
        width: 1px;
        height: 16px;
        background-color: #c4c6cc;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
