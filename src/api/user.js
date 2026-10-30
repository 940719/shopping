import { get, post, put, del } from '@/utils/request';

// 角色数字码：1 超级管理员 / 2 管理员 / 3 普通用户
export const ROLE_MAP = {
  1: '超级管理员',
  2: '管理员',
  3: '普通用户',
};

export const ROLE_OPTIONS = [
  { value: 1, label: '超级管理员' },
  { value: 2, label: '管理员' },
  { value: 3, label: '普通用户' },
];

export function getRoleLabel(code) {
  return ROLE_MAP[code] ?? '未知角色';
}

/**
 * 登录
 * POST /api/auth/login  body: { name, password }
 * 返回用户信息（不含密码），role 为角色数字码 1|2|3
 */
export const login = (name, password) => {
  return post('/auth/login', { name, password });
};

/** 免登录恢复：管理端跳转携带的 JWT 换取用户信息 POST /api/auth/restore */
export const restoreByToken = (token) => {
  return post('/auth/restore', { token });
};

/** 用户列表 GET /api/users/list */
export const getUserList = () => {
  return get('/users/list');
};

/**
 * 创建用户 POST /api/users/add
 * @param data
 * @returns
 */
export const postUser = (data) => {
  return post('/users/add', data);
};

/**
 * 通过用户ID获取用户信息 GET /api/users/detail/:id
 * @param id
 * @returns
 */
export const getUserById = (id) => {
  return get(`/users/detail/${id}`);
};

/**
 * 通过用户ID更新用户信息 PUT /api/users/update/:id
 * @param id
 * @param data
 */
export const putUserById = (id, data) => {
  return put(`/users/update/${id}`, data);
};

/**
 * 通过用户ID删除用户 DELETE /api/users/delete/:id
 * @param id
 * @returns
 */
export const deleteUserById = (id) => {
  return del(`/users/delete/${id}`);
};


/** 修改当前用户昵称 PUT /api/users/me */
export const updateMyProfile = (data) => put('/users/me', data);
