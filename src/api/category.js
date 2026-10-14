import { get } from '@/utils/request'

/**
 * 商品类型列表
 * GET /api/getCategories?page=&pageSize= → { code, data: { list: [{ id, name, sort, createTime }] } }
 */
export const getCategoryList = (data) =>
  get('/getCategories', { params: data })
