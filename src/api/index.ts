/** 后端统一响应结构（见 server/src/utils/response.js）：{ code, data, msg } */
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg: string
}
