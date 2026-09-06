import request from '@/utils/request'


interface UserData {
    id: number
    name: string
    age: number
};

export const getUserList = () => {
    return request.get('/users')
};

/**
 * 创建用户
 * @param data 
 * @returns 
 */
export const postUser = (data: UserData) => {
    return request.post('/user', data)
};

/**
 * 通过用户ID获取用户信息
 * @param id 
 * @returns 
 */
export const getUserById = (id: number) => {
    return request.get(`/user/${id}`)
};

/**
 * 通过用户ID更新用户信息
 * @param id 
 * @param data
 */
export const putUserById = (id: number, data: UserData) => {
    return request.put(`/user/${id}`, data)
}

/**
 * 通过用户ID删除用户
 * @param id 
 * @returns     
 */
export const deleteUserById = (id: number) => {
    return request.delete(`/user/${id}`)
}