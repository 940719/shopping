import { get, post } from '@/utils/request';

/** 商品评价列表 GET /api/reviews/list/:productId（公开） */
export const getReviewList = (productId) => get(`/reviews/list/${productId}`);

/** 提交评价 { productId, rating, content } POST /api/reviews/add（需登录） */
export const postReview = (data) => post('/reviews/add', data);
