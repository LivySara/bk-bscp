// 项目列表查询参数
export interface IProjectQuery {
  start?: number;
  limit?: number;
  all?: boolean;
  search_condition?: {
    [key:string]: string;
  }
}

// 项目详情
export interface IProjectItem {
  id: number;
  name: string;
  code: string;
  description?: string;
  env_count: number;
  service_count: number;
  creator: string;
  created_at: string;
}

// 项目创建/编辑参数
export interface IProjectEditArg {
  id?: number;
  name: string;
  code?: string;
  description?: string;
}
