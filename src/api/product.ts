import { get, post, put, del } from '@/utils/request'

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
 *
 * 注意：必须使用 @/utils/request 导出的 get 封装（内部 request.get<T, T>），
 * 其返回类型与响应拦截器（response => response.data）保持一致，
 * 直接调用 request.get<T> 只会传一个泛型，返回类型会变成 AxiosResponse<T> 包装导致 result.code / result.data 类型报错。
 */
export const getProductList = (type?: string) =>
  get<ApiResponse<Product[]>>('/products', {
    params: type ? { type } : undefined,
  })

/**
 * 根据 id 查询单个商品
 * GET /api/product/:id
 */
export const getProductById = (id: number) =>
  get<ApiResponse<Product>>(`/product/${id}`)

/**
 * 新增商品
 * POST /api/product
 */
export const postProduct = (data: ProductPayload) =>
  post<ApiResponse<Product>>('/product', data)

/**
 * 修改商品（未传字段保留原值）
 * PUT /api/product/:id
 */
export const putProductById = (id: number, data: ProductPayload) =>
  put<ApiResponse<Product>>(`/product/${id}`, data)

/**
 * 删除商品
 * DELETE /api/product/:id
 */
export const deleteProductById = (id: number) =>
  del<ApiResponse<number>>(`/product/${id}`)

/**
 * 上传商品图片（multipart/form-data，字段名 image）
 * POST /api/product/:id/image
 */
export const uploadProductImage = (id: number, file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  return post<ApiResponse<Product>>(`/product/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 商品图片地址：无图时返回 null，方便页面兜底 */
export const productImageUrl = (p: Product): string | null => p.image || null
