import { get, post, del } from '@/utils/request';

/** 收藏列表 GET /api/favorites/list */
export const getFavorites = () => get('/favorites/list');

/** 已收藏商品 id 集合 GET /api/favorites/ids */
export const getFavoriteIds = () => get('/favorites/ids');

/** 收藏商品 { productId } POST /api/favorites/add */
export const addFavorite = (productId) => post('/favorites/add', { productId });

/** 取消收藏 DELETE /api/favorites/delete/:id */
export const removeFavorite = (id) => del(`/favorites/delete/${id}`);
