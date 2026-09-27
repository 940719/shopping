import { get, post, put, del } from '@/utils/request'

// 角色数字码：1 超级管理员 / 2 管理员 / 3 普通用户
export const ROLE_MAP = {
    1: '超级管理员',
    2: '管理员',
    3: '普通用户',
}

export const ROLE_OPTIONS = [
    { value: 1, label: '超级管理员' },
    { value: 2, label: '管理员' },
    { value: 3, label: '普通用户' },
]

export function getRoleLabel(code) {
    return ROLE_MAP[code] ?? '未知角色'
}

/**
 * 登录
 * POST /api/login  body: { name, password }
 * 返回用户信息（不含密码），role 为角色数字码 1|2|3
 */
export const login = (name, password) => {
    return post('/login', { name, password })
};

export const getUserList = () => {
    return get('/users')
};

/**
 * 创建用户
 * @param data
 * @returns
 */
export const postUser = (data) => {
    return post('/user', data)
};

/**
 * 通过用户ID获取用户信息
 * @param id
 * @returns
 */
export const getUserById = (id) => {
    return get(`/user/${id}`)
};

/**
 * 通过用户ID更新用户信息
 * @param id
 * @param data
 */
export const putUserById = (id, data) => {
    return put(`/user/${id}`, data)
}

/**
 * 通过用户ID删除用户
 * @param id
 * @returns
 */
export const deleteUserById = (id) => {
    return del(`/user/${id}`)
}
