import { localT } from '../i18n';
import type { IDetailFilter, IDetailRow, IOverviewCard, IPieDatum, TaskStatus } from '../types/process-operation-statistics';

export const OVERVIEW_CARDS: IOverviewCard[] = [
  {
    title: localT('平台问题导致失败'),
    value: 61,
    sub: localT('平台问题导致失败'),
    tone: 'warn',
  },
  {
    title: localT('执行失败实例数'),
    value: 967,
    sub: localT('失败实例数'),
    tone: 'warn',
  },
  {
    title: localT('执行实例总数'),
    value: 2860,
    sub: localT('实例总数'),
    tone: 'muted',
  },
];

export const ERROR_CODE_DATA: IPieDatum[] = [
  { name: '836', value: 812, color: '#3A84FF' },
  { name: '1015000', value: 94, color: '#8FD14F' },
  { name: '4101004', value: 61, color: '#FFB400' },
];

export const CREATOR_DATA: IPieDatum[] = [
  { name: localT('王小明'), value: 812, color: '#3A84FF' },
  { name: localT('张三'), value: 94, color: '#8FD14F' },
  { name: localT('李四'), value: 61, color: '#FFB400' },
];

export const BUSINESS_DATA: IPieDatum[] = [
  { name: localT('支付业务'), value: 402, color: '#3A84FF' },
  { name: localT('游戏业务'), value: 268, color: '#8FD14F' },
  { name: localT('广告业务'), value: 151, color: '#FFB400' },
  { name: localT('内容业务'), value: 96, color: '#F26E6E' },
  { name: localT('其他'), value: 50, color: '#9AA5B8' },
];

export const STATUS_MAP: Record<TaskStatus, string> = {
  FAILURE: localT('失败'),
  TIMEOUT: localT('超时'),
  IGNORED: localT('忽略'),
  SUCCESS: localT('成功'),
};

export const STATUS_THEME_MAP: Record<TaskStatus, string> = {
  FAILURE: 'danger',
  TIMEOUT: 'warning',
  IGNORED: 'info',
  SUCCESS: 'success',
};

export const STATUS_OPTIONS = [
  { value: '', label: localT('全部') },
  { value: 'FAILURE', label: STATUS_MAP.FAILURE },
  { value: 'TIMEOUT', label: STATUS_MAP.TIMEOUT },
  { value: 'IGNORED', label: STATUS_MAP.IGNORED },
];

export const CREATOR_OPTIONS = [
  localT('王小明'),
  localT('张三'),
  localT('李四'),
];

export const ERROR_CODE_OPTIONS = [
  { value: '', label: localT('全部') },
  { value: '836', label: '836' },
  { value: '1015000', label: '1015000' },
  { value: '4101004', label: '4101004' },
  { value: '0', label: localT('无错误码') },
];

export const DEFAULT_DETAIL_FILTER: IDetailFilter = {
  status: '',
  creator: '',
  errorCode: '',
};

export const DETAIL_ROWS: IDetailRow[] = [
  {
    taskId: 'a3f9c1e2-7b4d-4f8a-9c1d-8e2b5a6f7c01',
    creator: localT('王小明'),
    processInstanceId: 100231,
    status: 'FAILURE',
    startTime: '2026-11-19 10:24:11',
    endTime: '2026-11-19 10:24:19',
    errorCode: 836,
    failedReason: localT('GSE执行失败进程不存在请检查托管状态'),
  },
  {
    taskId: 'b7d2e4f1-2c9a-4b6e-8f3a-1c5d7e9b2a02',
    creator: localT('王小明'),
    processInstanceId: 100232,
    status: 'FAILURE',
    startTime: '2026-11-19 10:31:02',
    endTime: '2026-11-19 10:31:06',
    errorCode: 836,
    failedReason: localT('GSE执行失败进程未托管'),
  },
  {
    taskId: 'c1a8f3b2-6d5e-4c7a-9b2f-3e8d6c4a1b03',
    creator: localT('张三'),
    processInstanceId: 100233,
    status: 'FAILURE',
    startTime: '2026-11-19 11:02:47',
    endTime: '2026-11-19 11:02:52',
    errorCode: 4101004,
    failedReason: localT('平台问题进程实例状态回写失败'),
  },
  {
    taskId: 'd9e4b7c1-8f2a-4d5b-8e7c-2a1f9b3d6e04',
    creator: localT('李四'),
    processInstanceId: 100234,
    status: 'TIMEOUT',
    startTime: '2026-11-19 11:15:20',
    endTime: '2026-11-19 11:45:20',
    errorCode: null,
    failedReason: localT('任务执行超时未在最大执行时间内完成'),
  },
  {
    taskId: 'e2c7a1d9-4b8f-4e6c-9a3d-7f5b2e8c1a05',
    creator: localT('王小明'),
    processInstanceId: 100235,
    status: 'FAILURE',
    startTime: '2026-11-19 13:06:33',
    endTime: '2026-11-19 13:06:38',
    errorCode: 1015000,
    failedReason: localT('GSE执行失败脚本执行超时'),
  },
  {
    taskId: 'f4b8d2e6-1a7c-4f9b-8d5e-6c3a9b1e7d06',
    creator: localT('张三'),
    processInstanceId: 100236,
    status: 'FAILURE',
    startTime: '2026-11-19 14:22:09',
    endTime: '2026-11-19 14:22:14',
    errorCode: 4101004,
    failedReason: localT('平台问题CMDB配置快照对比失败'),
  },
  {
    taskId: 'a7e1c5b3-9d4f-4a2e-8c6b-5e1d8f3a9c07',
    creator: localT('李四'),
    processInstanceId: 100237,
    status: 'IGNORED',
    startTime: '2026-11-19 15:03:51',
    endTime: '2026-11-19 15:03:53',
    errorCode: 828,
    failedReason: localT('幂等忽略进程已在运行'),
  },
  {
    taskId: 'b3d9f7a5-2e6c-4b1d-9a8f-4c7e1b5d2f08',
    creator: localT('王小明'),
    processInstanceId: 100238,
    status: 'TIMEOUT',
    startTime: '2026-11-19 16:40:12',
    endTime: '2026-11-19 17:10:12',
    errorCode: null,
    failedReason: localT('任务执行超时未在最大执行时间内完成'),
  },
  {
    taskId: 'c5f2a8d4-7b1e-4c3a-8f6d-1e9b5c7a3d09',
    creator: localT('张三'),
    processInstanceId: 100239,
    status: 'FAILURE',
    startTime: '2026-11-20 09:12:44',
    endTime: '2026-11-20 09:12:49',
    errorCode: 836,
    failedReason: localT('GSE执行失败目标进程不存在'),
  },
  {
    taskId: 'd8b4e2f6-3a9c-4d1b-9e5f-2c8a6b4e1f10',
    creator: localT('李四'),
    processInstanceId: 100240,
    status: 'FAILURE',
    startTime: '2026-11-20 09:58:17',
    endTime: '2026-11-20 09:58:21',
    errorCode: 1015000,
    failedReason: localT('GSE执行失败脚本退出码非0'),
  },
];
