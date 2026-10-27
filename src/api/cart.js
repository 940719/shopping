import { get, post, put, del } from '@/utils/request';

/** 购物车列表 GET /api/cart/get */
export const getCartList = () => get('/cart/get');

/** 加入购物车 { productId, quantity } POST /api/cart/add */
export const addToCart = (data) => post('/cart/add', data);

/** 更新数量 { quantity } PUT /api/cart/update/:id */
export const updateCartQty = (id, quantity) => put(`/cart/update/${id}`, { quantity });

/** 删除单项 DELETE /api/cart/delete/:id */
export const deleteCartItem = (id) => del(`/cart/delete/${id}`);
