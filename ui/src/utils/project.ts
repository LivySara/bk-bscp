import { getProjectList } from '../api/project';
import type { ISpaceProject, IProjectItem } from '../../types/project';

/**
 * 模块级缓存：某空间项目列表的请求 Promise
 * 缓存请求而非结果，使并发调用能命中同一次请求
 */
const projectListCache: Record<string, Promise<IProjectItem[]>> = {};

/** 缓存失效回调：spaceId 未传表示全部失效 */
type CacheInvalidHandler = (spaceId?: string) => void;

const cacheInvalidHandlers = new Set<CacheInvalidHandler>();

/**
 * 跨标签页广播通道
 * 项目管理页经 openInNewTab 打开，模块级缓存按标签页隔离，
 * 需广播让其他标签页同步失效，否则原窗口一直读到旧数据
 */
const cacheChannel =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('bscp-project-list-cache') : null;

const removeProjectListCache = (spaceId?: string) => {
  if (spaceId) {
    delete projectListCache[spaceId];
  } else {
    Object.keys(projectListCache).forEach((key) => delete projectListCache[key]);
  }
};

const notifyCacheInvalid = (spaceId?: string) => {
  cacheInvalidHandlers.forEach((handler) => handler(spaceId));
};

if (cacheChannel) {
  cacheChannel.onmessage = (event: MessageEvent<{ spaceId?: string }>) => {
    // 其他标签页发起的失效：清本地缓存并通知订阅者，但不再回播避免循环
    removeProjectListCache(event.data?.spaceId);
    notifyCacheInvalid(event.data?.spaceId);
  };
}

/**
 * 共享数据入口：所有需要"某空间全部项目"的逻辑统一走这里
 * 同一 spaceId 只发一次请求，后续直接复用缓存
 * 项目发生增删改后需调用 clearProjectListCache 失效缓存
 * @param spaceId 空间ID
 * @returns 项目列表
 */
export const getCachedProjectList = (spaceId: string): Promise<IProjectItem[]> => {
  if (!projectListCache[spaceId]) {
    projectListCache[spaceId] = getProjectList(spaceId, { all: true })
      .then((res) => {
        const projects = res.data?.projects || [];
        // 后端保证每个空间必有默认项目，空结果视为异常，不留缓存以便下次重试
        if (!projects.length) {
          delete projectListCache[spaceId];
        }
        return projects;
      })
      .catch((e) => {
        // 请求失败不能留下 rejected 的 Promise，否则整个页面周期内都取不到列表
        delete projectListCache[spaceId];
        throw e;
      });
  }
  return projectListCache[spaceId];
};

/**
 * 失效项目列表缓存
 * @param spaceId 指定空间ID，不传则清空全部
 */
export const clearProjectListCache = (spaceId?: string) => {
  removeProjectListCache(spaceId);
  // 通知本窗口的订阅者刷新派生状态
  notifyCacheInvalid(spaceId);
  // 项目管理页由 openInNewTab 打开，模块级缓存按标签页隔离，需广播通知其他标签页
  cacheChannel?.postMessage({ spaceId });
};

/**
 * 订阅项目列表缓存失效事件（含其他标签页触发的失效）
 * @param handler 失效回调，参数为失效的 spaceId，未传表示全部失效
 * @returns 取消订阅函数
 */
export const onProjectListCacheInvalid = (handler: CacheInvalidHandler) => {
  cacheInvalidHandlers.add(handler);
  return () => {
    cacheInvalidHandlers.delete(handler);
  };
};

/**
 * 无项目概念的模块列表
 * 这些模块不需要 projectId 参数
 */
export const NO_PROJECT_CONCEPT_MODULES = ['process', 'config-template', 'task', 'project-manage'];

/**
 * 判断某个导航模块是否有项目概念
 * @param navModule 导航模块名称
 * @returns 是否有项目概念
 */
export const hasProjectConcept = (navModule: string | undefined): boolean => {
  if (!navModule) return false;
  return !NO_PROJECT_CONCEPT_MODULES.includes(navModule);
};

/**
 * localStorage 中存储当前空间和项目对应关系的 key
 */
export const LAST_SPACE_TO_PROJECT_ID_KEY = 'lastSpaceToProjectId';

/**
 * 保存当前选择的空间和项目对应关系
 * 只记录当前选择，不保留历史映射
 * @param spaceId 空间ID
 * @param projectId 项目ID
 */
export const saveSpaceToProjectId = (spaceId: string, projectId: string) => {
  const data: ISpaceProject = { spaceId, projectId };
  localStorage.setItem(LAST_SPACE_TO_PROJECT_ID_KEY, JSON.stringify(data));
};

/**
 * 获取 spaceId 对应的 projectId
 * 只返回当前存储的 projectId（如果 spaceId 匹配的话）
 * @param spaceId 空间ID
 * @returns projectId 或 undefined
 */
export const getSpaceToProjectId = (spaceId: string): string | undefined => {
  try {
    const data = localStorage.getItem(LAST_SPACE_TO_PROJECT_ID_KEY);
    if (!data) return undefined;

    const parsed: ISpaceProject = JSON.parse(data);
    if (parsed.spaceId === spaceId) {
      return parsed.projectId;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

/**
 * 获取默认的 projectId
 * 优先从 localStorage 获取，如果无效则获取项目列表的第一个项目
 * @param spaceId 空间ID
 * @returns projectId
 */
export const getDefaultProjectId = async (spaceId: string): Promise<string> => {
  // 1. 先从 localStorage 获取上次使用的 projectId
  const lastProjectId = getSpaceToProjectId(spaceId);

  // 2. 获取项目列表（走共享缓存入口）
  const projects = await getCachedProjectList(spaceId);

  // 3. 如果 localStorage 中有值，且存在于项目列表中，则使用它
  if (lastProjectId) {
    const exists = projects.some((proj: IProjectItem) => String(proj.id) === lastProjectId);
    if (exists) {
      return lastProjectId;
    }
  }

  // 4. 否则，返回项目列表的第一个项目的 ID
  if (projects.length > 0) {
    return String(projects[0].id);
  }

  // 5. 如果没有项目，返回空字符串
  return '';
};
