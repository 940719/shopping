import { get, post } from '@/utils/request';

/** 领券中心（可领券列表）GET /api/coupons/list */
export const getCouponCenter = () => get('/coupons/list');

/** 领取优惠券 POST /api/coupons/receive/:id */
export const receiveCoupon = (id) => post(`/coupons/receive/${id}`);

/** 我的优惠券（status: 0未使用 1已使用 2已过期，不传返回全部）GET /api/coupons/mine */
export const getMyCoupons = (params) => get('/coupons/mine', { params });
