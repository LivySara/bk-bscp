export interface IPieDatum {
  name: string;
  value: number;
  color?: string;
}

export interface IOverviewCard {
  title: string;
  value: number;
  sub: string;
  tone?: 'warn' | 'muted' | '';
}

export type TaskStatus = 'FAILURE' | 'TIMEOUT' | 'IGNORED' | 'SUCCESS';

export interface IDetailRow {
  taskId: string;
  creator: string;
  processInstanceId: number;
  status: TaskStatus;
  startTime: string;
  endTime: string;
  errorCode: number | null;
  failedReason: string;
}

export interface IGlobalFilter {
  timeRange: [string, string];
  orgIds: string[];
  creators: string[];
}

export interface IDetailFilter {
  status: TaskStatus | '';
  creator: string;
  errorCode: string;
}
