import { get, post, put, del } from '@/utils/request'
import type { ApiResponse } from './index'

export type RoleCode = 1 | 2 | 3

// 用户完整类型，和后端toUserJSON返回结构一一对应
export interface UserData {
    id: number
    name: string
    nickname?: string
    phone?: string
    avatar?: string
    role: RoleCode // 角色数字类型 1|2|3
    createTime?: string
}

export const ROLE_MAP: Record<RoleCode, string> = {
    1: '超级管理员',
    2: '管理员',
    3: '普通用户',
}

export const ROLE_OPTIONS = [
    { value: 1 as RoleCode, label: '超级管理员' },
    { value: 2 as RoleCode, label: '管理员' },
    { value: 3 as RoleCode, label: '普通用户' },
]

export function getRoleLabel(code: number): string {
    return ROLE_MAP[code as RoleCode] ?? '未知角色'
}

/**
 * 登录
 * POST /api/login  body: { name, password }
 * 返回用户信息（不含密码），role 为角色数字码 1|2|3
 */
export const login = (name: string, password: string) => {
    return post<ApiResponse<UserData>>('/login', { name, password })
};

export const getUserList = () => {
    return get<ApiResponse<UserData[]>>('/users')
};

/**
 * 创建用户
 * @param data 
 * @returns 
 */
export const postUser = (data: UserData) => {
    return post<ApiResponse<UserData>>('/user', data)
};

/**
 * 通过用户ID获取用户信息
 * @param id 
 * @returns 
 */
export const getUserById = (id: number) => {
    return get<ApiResponse<UserData>>(`/user/${id}`)
};

/**
 * 通过用户ID更新用户信息
 * @param id 
 * @param data
 */
export const putUserById = (id: number, data: UserData) => {
    return put<ApiResponse<UserData>>(`/user/${id}`, data)
}

/**
 * 通过用户ID删除用户
 * @param id 
 * @returns     
 */
export const deleteUserById = (id: number) => {
    return del<ApiResponse<number>>(`/user/${id}`)
}