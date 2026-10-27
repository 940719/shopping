import { get, post, put, del } from '@/utils/request';

/**
 * 商品列表（可按类型过滤）
 * GET /api/products/list?type=xxx
 */
export const getProductList = (type) =>
  get('/products/list', {
    params: type ? { type } : undefined,
  });

/**
 * 根据 id 查询单个商品
 * GET /api/products/detail/:id
 */
export const getProductById = (id) => get(`/products/detail/${id}`);

/**
 * 新增商品
 * POST /api/products/add
 */
export const postProduct = (data) => post('/products/add', data);

/**
 * 修改商品（未传字段保留原值）
 * PUT /api/products/update/:id
 */
export const putProductById = (id, data) => put(`/products/update/${id}`, data);

/**
 * 删除商品
 * DELETE /api/products/delete/:id
 */
export const deleteProductById = (id) => del(`/products/delete/${id}`);

/**
 * 上传商品图片（multipart/form-data，字段名 image）
 * POST /api/products/uploadImage/:id
 */
export const uploadProductImage = (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return post(`/products/uploadImage/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** 读取商品图片 GET /api/products/image/:id */
export const getProductImage = (id) => get(`/products/image/${id}`);

/**
 * 通用图片上传（multipart/form-data，字段名 file）
 * POST /api/uploads → { url, filename }
 * 后端把文件保存到本地 uploads 目录，url 可直接用于 <img :src> 或存 emoji 字段
 */
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** 商品图片地址：无图时返回 null，方便页面兜底 */
export const productImageUrl = (p) => p.image || null;
