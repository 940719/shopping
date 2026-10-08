import { get, post, put, del } from '@/utils/request';

export const getCategoryList = (data) => {
  return get('/getCategories', { params: data });
};
