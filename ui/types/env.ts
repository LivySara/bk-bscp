// 环境类型枚举
export enum EnvType {
  PRODUCTION = 'prod',
  STAGING = 'staging',
  TESTING = 'test',
  DEVELOPMENT = 'dev',
}

// 环境数据实体（id 支持 string | number，兼容不同接口返回）
export interface IEnvItem {
  id: string | number;
  name: string;
  code?: string;
  type?: EnvType;
  description?: string;
  service_count?: number;
  creator?: string;
  created_at?: string;
}

// 按类型分组的环境列表项（用于环境选择器）
// type 使用 EnvType 枚举值，展示时可通过 ENV_TYPE_CONFIG 取对应文案/图标
export interface IEnvGroupItem {
  type: EnvType;
  name: string;
  envs: IEnvItem[];
}

// 查询参数
export interface IEnvQuery {
  start: number;
  limit: number;
  search_value?: string;
}
