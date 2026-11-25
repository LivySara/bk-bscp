<template>
  <div ref="canvasRef" class="pie-canvas"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Pie } from '@antv/g2plot';
  import type { IPieDatum } from '../../../../types/process-operation-statistics';

  const { t } = useI18n();

  const props = defineProps<{
    data: IPieDatum[];
  }>();

  let piePlot: Pie | undefined;
  const canvasRef = ref<HTMLElement>();

  const initChart = () => {
    if (!canvasRef.value) return;
    piePlot = new Pie(canvasRef.value, {
      data: props.data.map((item) => ({ ...item })),
      angleField: 'value',
      colorField: 'name',
      radius: 0.85,
      autoFit: true,
      label: {
        type: 'inner',
        offset: '-30%',
        content: ({ percent }: { percent: number }) => `${(percent * 100).toFixed(1)}%`,
        style: { fontSize: 12, textAlign: 'center' },
        autoRotate: false,
      },
      tooltip: {
        showTitle: true,
        title: 'name',
        fields: ['value', 'percent'],
        customItems: (originalItems: any[]) => {
          originalItems[0].name = originalItems[0].title;
          originalItems[1].name = t('占比');
          originalItems[1].value = `${(Number(originalItems[1].value) * 100).toFixed(1)}%`;
          return originalItems;
        },
      },
      interactions: [{ type: 'element-highlight' }],
      legend: {
        position: 'bottom',
        layout: 'horizontal',
        flipPage: false,
        maxWidth: 320,
      },
    });
    piePlot.render();
  };

  watch(
    () => props.data,
    (value) => {
      piePlot?.changeData(value.map((item) => ({ ...item })));
    },
  );

  onMounted(initChart);
  onBeforeUnmount(() => {
    piePlot?.destroy();
    piePlot = undefined;
  });
</script>

<style scoped lang="scss">
  .pie-canvas {
    height: 210px;
    width: 100%;
  }
</style>
