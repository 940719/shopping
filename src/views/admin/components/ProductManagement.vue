<template>
  <!-- 商品管理 -->
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">商品管理</span>
      <van-button size="small" type="danger" class="add-btn" @click="openAdd">＋ 新增商品</van-button>
    </div>
    <div class="table-wrap">
      <base-table :columns="productTableColumns" :table-data="tableData" row-key="id">
        <template #cell-emoji="{ row }">
          <img v-if="isImgUrl(row.emoji)" :src="row.emoji" class="cell-thumb" alt="" />
          <span v-else class="cell-emoji">{{ row.emoji }}</span>
        </template>
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
        <div class="edit-title">{{ isEditMode ? '编辑商品' : '新增商品' }}</div>
        <van-cell-group inset class="edit-group">
          <van-field v-model="editing.name" label="商品名称" placeholder="请输入商品名称" />
          <van-field label="商品图片" readonly>
            <template #input>
              <div class="img-upload">
                <span class="upload-thumb" :style="{ background: editing.bg }">
                  <img v-if="isImgUrl(editing.emoji)" :src="editing.emoji" class="upload-img" alt="" />
                  <span v-else class="upload-emoji">{{ editing.emoji || '📦' }}</span>
                </span>
                <van-button size="mini" type="primary" plain :loading="uploading" @click="triggerUpload">
                  上传图片
                </van-button>
                <van-button v-if="editing.emoji" size="mini" plain @click="editing.emoji = ''">移除</van-button>
                <input ref="fileInputRef" type="file" accept="image/*" hidden @change="onFileChange" />
              </div>
            </template>
          </van-field>
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
          <span class="preview-thumb" :style="{ background: editing.bg }">
            <img v-if="isImgUrl(editing.emoji)" :src="editing.emoji" class="upload-img" alt="" />
            <span v-else>{{ editing.emoji || '📦' }}</span>
          </span>
          <span class="preview-price">¥{{ editing.price || 0 }}</span>
        </div>

        <div class="edit-actions">
          <van-button round block plain class="cancel-btn" @click="showEdit = false">取消</van-button>
          <van-button round block type="danger" class="save-btn" :loading="saving" @click="saveGoods">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script setup lang="ts">
import type { TableColumn } from '@/components/BaseTable/index.vue'
import { showToast, showConfirmDialog } from 'vant'
import { type Goods, GOODS_BG_PRESETS } from '@/store/goods'
import { onMounted, ref } from 'vue'
import { getProductList, postProduct, putProductById, uploadImage, type ProductPayload } from '@/api/product'

/* ================= 图片工具 ================= */
/** emoji 字段存的是图片 URL（http/https 或 /uploads 开头），否则视为 emoji 字符 */
const isImgUrl = (v: string | null | undefined) =>
  !!v && (/^https?:\/\//i.test(v) || v.startsWith('/uploads/'))

/* ================= 表格 ================= */
const editGoods = (row: Goods) => {
  editing.value = { ...row }
  isEditMode.value = true
  showEdit.value = true
}

const removeGoods = (row: Goods) => {
  console.log('删除商品：', row)
  showConfirmDialog({ title: '删除商品：', message: `确定删除商品「${row.name}」吗？` })
    .then(() => {
      showToast('已删除')
    })
    .catch(() => { })
}

const productTableColumns: TableColumn[] = [
  { key: 'id', label: 'ID', width: 60 },
  { key: 'name', label: '商品名称' },
  { key: 'emoji', label: '图片', width: 120, render: () => '' },
  { key: 'price', label: '现价', },
  { key: 'originPrice', label: '原价' },
  { key: 'flashPrice', label: '秒杀价' },
  { key: 'sales', label: '销量' },
  { key: 'bg', label: '背景色' },
  { key: 'operate', label: '操作', width: 160 }
]

/* ================= 编辑 / 新增 ================= */
const tableData = ref<Goods[]>([])
const editing = ref<Goods | null>(null)
const isEditMode = ref(false)
const showEdit = ref(false)
const saving = ref(false)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement>()

const openAdd = () => {
  editing.value = {
    id: Date.now(),
    name: '新商品',
    type: 1,
    emoji: '',
    bg: GOODS_BG_PRESETS[0],
    price: 99,
    originPrice: 129,
    flashPrice: 0,
    sales: 0
  }
  isEditMode.value = false
  showEdit.value = true
}

/* ================= 图片上传 ================= */
const triggerUpload = () => fileInputRef.value?.click()

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片不能超过 5MB')
    input.value = ''
    return
  }
  uploading.value = true
  try {
    const { code, data } = await uploadImage(file)
    if (code !== 200 || !data) {
      showToast('上传失败')
      return
    }
    if (editing.value) editing.value.emoji = data.url
    showToast('图片已上传')
  } catch (error) {
    console.error('图片上传失败：', error)
    showToast('上传失败，请重试')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

/* ================= 保存 ================= */
const saveGoods = async () => {
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
  const payload: ProductPayload = {
    type: String(g.type),
    name: g.name.trim(),
    price: g.price,
    seckillPrice: g.flashPrice || null,
    emoji: g.emoji || null
  }
  saving.value = true
  try {
    if (isEditMode.value) {
      await putProductById(g.id, payload)
      showToast('商品已更新')
    } else {
      await postProduct(payload)
      showToast('商品已新增')
    }
    showEdit.value = false
    await initProductList()
  } catch (error) {
    console.error('保存商品失败：', error)
    showToast('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const initProductList = async () => {
  try {
    const { code, data } = await getProductList()
    if (code !== 200) {
      return
    }
    tableData.value = data
  } catch (error) {
    console.error('获取商品列表失败，错误信息：', error)
  }
}

onMounted(() => {
  initProductList()
})
</script>
<style lang="css" scoped>
.panel {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  height: 100%;
}

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

/* 表格图片缩略图 */
.cell-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  display: inline-block;
  vertical-align: middle;
}

.cell-emoji {
  font-size: 20px;
}

/* 上传控件 */
.img-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 0;
}

.upload-thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  font-size: 24px;
  overflow: hidden;
  flex-shrink: 0;
}

.upload-emoji {
  font-size: 24px;
}

.upload-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
