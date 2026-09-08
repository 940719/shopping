import { defineStore } from 'pinia'

export interface Goods {
  id: number
  name: string
  /** 商品图（mock 用 emoji 表示，后续可替换为图片 URL） */
  emoji: string
  /** 商品图背景渐变 */
  bg: string
  /** 现价 */
  price: number
  /** 原价（划线价） */
  originPrice: number
  /** 秒杀价，0 表示未参与秒杀 */
  flashPrice: number
  sales: number
}

interface GoodsState {
  goodsList: Goods[]
}

/** 商品背景渐变预设（管理后台编辑时可选） */
export const GOODS_BG_PRESETS = [
  'linear-gradient(135deg,#e6f7ff,#bae7ff)',
  'linear-gradient(135deg,#f0f5ff,#d6e4ff)',
  'linear-gradient(135deg,#fff7e6,#ffe7ba)',
  'linear-gradient(135deg,#fff0f6,#ffd6e7)',
  'linear-gradient(135deg,#fff1f0,#ffccc7)',
  'linear-gradient(135deg,#f6ffed,#d9f7be)',
  'linear-gradient(135deg,#f4f0ff,#efdbff)',
  'linear-gradient(135deg,#e6fffb,#b5f5ec)'
]

export const useGoodsStore = defineStore('goods', {
  state: (): GoodsState => ({
    goodsList: [
      { id: 1, name: '无线蓝牙耳机 主动降噪 长续航', emoji: '🎧', bg: 'linear-gradient(135deg,#e6f7ff,#bae7ff)', price: 199, originPrice: 299, flashPrice: 159, sales: 12000 },
      { id: 2, name: '智能手环 心率监测 50 米防水', emoji: '⌚', bg: 'linear-gradient(135deg,#f0f5ff,#d6e4ff)', price: 159, originPrice: 229, flashPrice: 129, sales: 8600 },
      { id: 3, name: '纯棉卫衣 情侣款 宽松百搭', emoji: '🧥', bg: 'linear-gradient(135deg,#fff7e6,#ffe7ba)', price: 129, originPrice: 189, flashPrice: 99, sales: 15000 },
      { id: 4, name: '保湿精华液 烟酰胺 提亮肤色', emoji: '🧴', bg: 'linear-gradient(135deg,#fff0f6,#ffd6e7)', price: 89, originPrice: 139, flashPrice: 69, sales: 21000 },
      { id: 5, name: '进口车厘子 JJ 级 2 斤装', emoji: '🍒', bg: 'linear-gradient(135deg,#fff1f0,#ffccc7)', price: 69, originPrice: 99, flashPrice: 0, sales: 32000 },
      { id: 6, name: '空气炸锅 5L 无油低脂 智能控温', emoji: '🍟', bg: 'linear-gradient(135deg,#f6ffed,#d9f7be)', price: 259, originPrice: 399, flashPrice: 0, sales: 5800 },
      { id: 7, name: '运动跑鞋 轻便透气 缓震回弹', emoji: '👟', bg: 'linear-gradient(135deg,#f4f0ff,#efdbff)', price: 219, originPrice: 329, flashPrice: 0, sales: 9800 },
      { id: 8, name: '智能保温杯 316 不锈钢 24 小时保温', emoji: '☕', bg: 'linear-gradient(135deg,#e6fffb,#b5f5ec)', price: 79, originPrice: 119, flashPrice: 0, sales: 17000 }
    ]
  }),
  actions: {
    /** 更新商品（管理后台编辑后调用，首页实时生效） */
    updateGoods(goods: Goods) {
      const i = this.goodsList.findIndex((g) => g.id === goods.id)
      if (i > -1) this.goodsList[i] = { ...goods }
    },
    /** 新增商品 */
    addGoods(goods: Goods) {
      this.goodsList.unshift(goods)
    },
    /** 删除商品 */
    removeGoods(id: number) {
      this.goodsList = this.goodsList.filter((g) => g.id !== id)
    }
  }
})
