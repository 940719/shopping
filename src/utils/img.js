export const isImgUrl = (v) => !!v && (/^https?:\/\//i.test(v) || v.startsWith('/uploads/'));
