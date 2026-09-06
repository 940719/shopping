import request from '@/utils/request'

/** 商品数据结构（与后端 /api/product 返回一致） */
export interface Product {
  id: number
  type: string
  name: string
  price: number
  seckillPrice: number | null
  image: string | null // data URI(base64) 或 URL，可直接用于 <img :src>
}

/** 后端统一响应包装 { code, data, msg } */
export interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}

/** 新增/修改商品的请求体 */
export interface ProductPayload {
  type?: string
  name?: string
  price?: number
  seckillPrice?: number | null
  image?: string | null
}

/**
 * 商品列表（可按类型过滤）
 * GET /api/products?type=xxx
 */
export const getProductList = (type?: string) =>
  request.get<ApiResponse<Product[]>>('/products', {
    params: type ? { type } : undefined,
  })

/**
 * 根据 id 查询单个商品
 * GET /api/product/:id
 */
export const getProductById = (id: number) =>
  request.get<ApiResponse<Product>>(`/product/${id}`)

/**
 * 新增商品
 * POST /api/product
 */
export const postProduct = (data: ProductPayload) =>
  request.post<ApiResponse<Product>>('/product', data)

/**
 * 修改商品（未传字段保留原值）
 * PUT /api/product/:id
 */
export const putProductById = (id: number, data: ProductPayload) =>
  request.put<ApiResponse<Product>>(`/product/${id}`, data)

/**
 * 删除商品
 * DELETE /api/product/:id
 */
export const deleteProductById = (id: number) =>
  request.delete<ApiResponse<number>>(`/product/${id}`)

/**
 * 上传商品图片（multipart/form-data，字段名 image）
 * POST /api/product/:id/image
 */
export const uploadProductImage = (id: number, file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  return request.post<ApiResponse<Product>>(`/product/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 商品图片地址：无图时返回 null，方便页面兜底 */
export const productImageUrl = (p: Product): string | null => p.image || null
