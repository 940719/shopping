import { get, post } from '@/utils/request';

/** 订单列表（status 可选：1待付款 2待发货 3待收货 4待评价）GET /api/orders/list */
export const getOrderList = (params) => get('/orders/list', { params });

/** 下单 { addressId, cartIds } POST /api/orders/add */
export const createOrder = (data) => post('/orders/add', data);

/** 付款（待付款 -> 待发货）POST /api/orders/pay/:id */
export const payOrder = (id) => post(`/orders/pay/${id}`);

/** 确认收货（待收货 -> 待评价）POST /api/orders/confirm/:id */
export const confirmOrder = (id) => post(`/orders/confirm/${id}`);

/** 取消订单 POST /api/orders/cancel/:id */
export const cancelOrder = (id) => post(`/orders/cancel/${id}`);
