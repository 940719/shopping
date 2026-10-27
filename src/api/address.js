import { get, post, put, del } from '@/utils/request';

/** 地址列表 GET /api/addresses/list */
export const getAddressList = () => get('/addresses/list');

/** 新增地址 POST /api/addresses/add */
export const addAddress = (data) => post('/addresses/add', data);

/** 编辑地址 PUT /api/addresses/update/:id */
export const updateAddress = (id, data) => put(`/addresses/update/${id}`, data);

/** 设为默认 PUT /api/addresses/setDefault/:id */
export const setDefaultAddress = (id) => put(`/addresses/setDefault/${id}`);

/** 删除地址 DELETE /api/addresses/delete/:id */
export const deleteAddress = (id) => del(`/addresses/delete/${id}`);
