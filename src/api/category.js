import { get } from '@/utils/request'

/**
 * 商品类型列表
 * GET /api/categories/list?page=&pageSize= → { code, data: { list: [{ id, name, sort, createTime }] } }
 */
export const getCategoryList = (data) =>
  get('/categories/list', { params: data })
