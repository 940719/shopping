<template>
  <!-- 商品管理 -->
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">商品管理</span>
      <van-button size="small" type="danger" class="add-btn" @click="openAdd">＋ 新增商品</van-button>
    </div>
    <div class="table-wrap">
      <base-table :columns="productTableColumns" :table-data="tableData" row-key="id">
        <template #cell-operate="{ row }">
          <van-button size="mini" type="primary" plain @click="editGoods(row)">
            编辑
          </van-button>
          <van-button size="mini" type="danger" plain @click="removeGoods(row)">删除</van-button>
        </template>
      </base-table>
    </div>
    <!-- 商品编辑弹窗 -->
    <van-popup v-model:show="showEdit" round position="bottom" class="edit-popup" :style="{ maxHeight: '80%' }">
      <div v-if="editing" class="edit-body">
        <div class="edit-title">编辑商品</div>
        <van-cell-group inset class="edit-group">
          <van-field v-model="editing.name" label="商品名称" placeholder="请输入商品名称" />
          <van-field v-model="editing.emoji" label="商品图片" placeholder="输入 emoji 作为商品图（如 🎧）" />
          <van-field v-model.number="editing.price" type="number" label="现价" placeholder="现价（元）" />
          <van-field v-model.number="editing.originPrice" type="number" label="原价" placeholder="原价（元）" />
          <van-field v-model.number="editing.flashPrice" type="number" label="秒杀价" placeholder="秒杀价（元），0 表示不参与秒杀" />
          <van-field v-model.number="editing.sales" type="number" label="销量" placeholder="销量" />
        </van-cell-group>

        <div class="edit-bg">
          <div class="bg-label">图片背景</div>
          <div class="bg-list">
            <span v-for="bg in GOODS_BG_PRESETS" :key="bg" class="bg-item" :class="{ active: editing.bg === bg }"
              :style="{ background: bg }" @click="editing.bg = bg"></span>
          </div>
        </div>

        <div class="edit-preview">
          <span class="preview-label">预览：</span>
          <span class="preview-thumb" :style="{ background: editing.bg }">{{ editing.emoji || '📦' }}</span>
          <span class="preview-price">¥{{ editing.price || 0 }}</span>
        </div>

        <div class="edit-actions">
          <van-button round block plain class="cancel-btn" @click="showEdit = false">取消</van-button>
          <van-button round block type="danger" class="save-btn" @click="saveGoods">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script setup lang="ts">
import type { TableColumn } from '@/components/BaseTable/index.vue'
import { showToast, showConfirmDialog } from 'vant'
import { type Goods, GOODS_BG_PRESETS } from '@/store/goods'
import { onMounted, ref } from 'vue';
import { getProductList } from '@/api/product';
const editGoods = (row: Goods) => {
  console.log('编辑商品：', row)
};
const removeGoods = (row: Goods) => {
  console.log('删除商品：', row)
  showConfirmDialog({ title: '删除商品：', message: `确定删除商品「${row.name}」吗？` })
    .then(() => {
      showToast('已删除')
    })
    .catch(() => { })

};
const productTableColumns: TableColumn[] = [
  { key: 'id', label: 'ID', width: 60 },
  { key: 'name', label: '商品名称' },
  { key: 'emoji', label: '图片', width: 120 },
  { key: 'price', label: '现价', },
  { key: 'originPrice', label: '原价' },
  { key: 'flashPrice', label: '秒杀价' },
  { key: 'sales', label: '销量' },
  { key: 'bg', label: '背景色' },
  { key: 'operate', label: '操作', width: 160 }
];
const tableData = ref<Goods[]>([]);
const editing = ref<Goods | null>(null)
const showEdit = ref(false)
const openAdd = () => {
  editing.value = {
    id: Date.now(),
    name: '新商品',
    type: 1,
    emoji: '📦',
    bg: GOODS_BG_PRESETS[0],
    price: 99,
    originPrice: 129,
    flashPrice: 0,
    sales: 0
  }
  showEdit.value = true
};


const saveGoods = () => {
  if (!editing.value) return
  const g = editing.value
  if (!g.name.trim()) {
    showToast('请输入商品名称')
    return
  }
  if (g.price <= 0 || g.originPrice <= 0) {
    showToast('价格必须大于 0')
    return
  }
  if (g.flashPrice < 0) {
    showToast('秒杀价不能为负数')
    return
  }
  // const exists = goodsStore.goodsList.some((x) => x.id === g.id)
  // if (exists) {
  //   goodsStore.updateGoods({ ...g })
  //   showToast('商品已更新，首页实时生效')
  // } else {
  //   goodsStore.addGoods({ ...g })
  //   showToast('商品已新增')
  // }
  showEdit.value = false
};
const initProductList = async () => {
  try {
    const { code, data } = await getProductList()
    if (code !== 200) {
      return;
    }
    tableData.value = data;
  } catch (error) {
    console.error('获取商品列表失败，错误信息：', error)
  }
};
onMounted(() => {
  initProductList();
})
</script>
<style lang="css" scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1b1c;
}

.panel-count {
  font-size: 12px;
  color: #999;
}
</style>