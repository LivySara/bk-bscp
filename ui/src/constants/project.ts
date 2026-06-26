import { getProjectList } from '../api/project';

/**
 * 无项目概念的模块列表
 * 这些模块不需要 projectId 参数
 */
export const NO_PROJECT_CONCEPT_MODULES = ['process', 'config-template', 'task', 'project-manage', 'env-manage'];

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
 * 判断某个路由是否有项目概念
 * @param routeName 路由名称
 * @returns 是否有项目概念
 */
export const routeHasProjectConcept = (routeName: string): boolean => {
  const noProjectConceptRoutes = ['process-management', 'config-template-management', 'task-list', 'task-detail', 'project-manage'];
  return !noProjectConceptRoutes.includes(routeName);
};

/**
 * localStorage 中存储 spaceId 到 projectId 映射的 key
 */
export const LAST_SPACE_TO_PROJECT_ID_KEY = 'lastSpaceToProjectId';

/**
 * 获取 spaceId 对应的 projectId 映射
 * @returns 映射对象
 */
const getSpaceToProjectIdMap = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(LAST_SPACE_TO_PROJECT_ID_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

/**
 * 保存 spaceId 到 projectId 的映射
 * @param spaceId 空间ID
 * @param projectId 项目ID
 */
export const saveSpaceToProjectId = (spaceId: string, projectId: string) => {
  const map = getSpaceToProjectIdMap();
  map[spaceId] = projectId;
  localStorage.setItem(LAST_SPACE_TO_PROJECT_ID_KEY, JSON.stringify(map));
};

/**
 * 获取 spaceId 对应的 projectId
 * @param spaceId 空间ID
 * @returns projectId 或 undefined
 */
export const getSpaceToProjectId = (spaceId: string): string | undefined => {
  const map = getSpaceToProjectIdMap();
  return map[spaceId];
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

  // 2. 获取项目列表
  const res = await getProjectList(spaceId, { all: true });
  const projects = res.data?.projects || [];

  // 3. 如果 localStorage 中有值，且存在于项目列表中，则使用它
  if (lastProjectId) {
    const exists = projects.some((proj: any) => String(proj.id) === lastProjectId);
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
