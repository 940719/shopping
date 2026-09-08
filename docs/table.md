# BaseTable 表格组件使用文档

> Vue3 + Setup + TS + Vite 封装的后台表格组件。基于原生 `<table>` 实现，无 UI 库依赖。

---

## ✨ 组件能力

- 表头固定（纵向滚动时表头不动）
- 横向滚动时支持**左侧固定列** / **右侧固定列**，支持多列固定，自动计算偏移
- 单元格插槽自定义渲染
- Loading 加载遮罩，支持插槽自定义 loading 文案
- 空数据提示，支持插槽自定义空状态
- 行点击事件 `@row-click`
- 选择功能：多选 checkbox（带全选） / 单选 radio
- 动态禁用指定行选择 `get-selectable`
- 列宽度支持：数字 / 字符串数字 / `px` / `%`
- 斑马纹、hover 高亮

---

## 📦 组件文件位置

```
src/
├── components/
│   └── BaseTable/
│       └── index.vue        # 表格组件
└── docs/
    └── table.md             # 本文档
```

---

## 📝 BaseTable Props

| 参数 | 类型 | 默认值 | 必填 | 说明 |
| ---- | ---- | ---- | ---- | ---- |
| columns | `TableColumn[]` | - | ✅ | 表格列配置 |
| tableData | `Record<string, any>[]` | `[]` | ❌ | 表格数据源 |
| rowKey | `string` | `'id'` | ❌ | 行唯一标识字段名 |
| containerHeight | `string` | `'400px'` | ❌ | 表格容器最大高度，超出出现滚动条 |
| loading | `boolean` | `false` | ❌ | 加载状态，显示遮罩 |
| selectionType | `'' \| 'checkbox' \| 'radio'` | `''` | ❌ | 选择类型，空字符串 = 关闭选择列 |
| getSelectable | `(row) => boolean` | `undefined` | ❌ | 判断该行是否允许勾选，返回 `false` 则禁用 |

---

## 📤 BaseTable Emits

| 事件名 | 参数 | 说明 |
| ---- | ---- | ---- |
| `row-click` | `row: 行数据` | 点击表格行时触发 |
| `selection-change` | `selectedRows: 选中行数组` | 选中项变化时触发 |

---

## 📌 TableColumn 列类型定义

```ts
export interface TableColumn<T = Record<string, any>> {
  key: string                                      // 列字段名，对应数据对象的key
  label: string                                    // 表头显示文字
  width?: number | string                          // 列宽：80 / "150" / "150px" / "20%"
  fixed?: 'left' | 'right' | false                 // 固定列：左侧 / 右侧 / 不固定
  render?: (row: T, column: TableColumn<T>) => string | VNode  // 自定义渲染函数（可选）
}
```

### width 支持的写法

```ts
// 数字，自动补 px
{ key: 'id', label: 'ID', width: 80 }

// 字符串纯数字，自动补 px
{ key: 'name', label: '名称', width: '220' }

// 带单位字符串，直接使用
{ key: 'price', label: '价格', width: '120px' }

// 百分比
{ key: 'desc', label: '描述', width: '30%' }
```

---

## 🧩 BaseTable 插槽

| 插槽名称 | 参数 | 说明 |
| ---- | ---- | ---- |
| `#loading` | - | 自定义加载提示内容 |
| `#empty` | - | 自定义空数据提示内容 |
| `#列的key` | `{ row, column }` | 单元格自定义插槽，插槽名等于列配置的 `key` |

### 单元格插槽示例

```vue
<BaseTable :columns="columns" :table-data="tableData">
  <!-- 插槽名 = 列的 key，这里是 operate -->
  <template #operate="{ row }">
    <button @click.stop="handleEdit(row)">编辑</button>
    <button @click.stop="handleDelete(row)">删除</button>
  </template>
</BaseTable>
```

---

## 🚀 使用示例

### 基础用法（无选择列）

```vue
<template>
  <BaseTable
    :columns="columns"
    :table-data="tableData"
    row-key="id"
    container-height="450px"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable/index.vue'

interface Product {
  id: number
  name: string
  price: number
  stock: number
}

const tableData = ref<Product[]>([
  { id: 1, name: 'iPhone 15', price: 5999, stock: 20 },
  { id: 2, name: '小米14', price: 3999, stock: 35 },
])

const columns: TableColumn<Product>[] = [
  { key: 'id', label: '商品ID', width: 80 },
  { key: 'name', label: '商品名称', width: '220' },
  { key: 'price', label: '售价', width: '120px' },
  { key: 'stock', label: '库存', width: '100px' },
]
</script>
```

### 多选 + 禁用行选择（完整示例）

```vue
<template>
  <BaseTable
    :columns="columns"
    :table-data="tableData"
    row-key="id"
    container-height="450px"
    :loading="tableLoading"
    selection-type="checkbox"
    :get-selectable="handleGetSelectable"
    @row-click="onRowClick"
    @selection-change="handleSelectionChange"
  >
    <!-- 操作列自定义插槽 -->
    <template #operate="{ row }">
      <button @click.stop="handleEdit(row)">编辑</button>
      <button @click.stop="handleDelete(row)">删除</button>
    </template>

    <!-- 自定义 loading 文案（可选） -->
    <!-- <template #loading>正在请求商品数据...</template> -->

    <!-- 自定义空数据提示（可选） -->
    <!-- <template #empty>暂无商品，请先新增</template> -->
  </BaseTable>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseTable, { type TableColumn } from '@/components/BaseTable/index.vue'

interface Product {
  id: number
  name: string
  price: number
  stock: number
  desc: string
}

const tableLoading = ref(false)
const tableData = ref<Product[]>([])

const columns: TableColumn<Product>[] = [
  { key: 'id', label: '商品ID', width: 80, fixed: 'left' },
  { key: 'name', label: '商品名称', width: '220' },
  { key: 'price', label: '售价', width: '120px' },
  { key: 'stock', label: '库存', width: '100px' },
  { key: 'desc', label: '商品描述', width: '350px' },
  { key: 'operate', label: '操作', width: '180px', fixed: 'right' },
]

// 禁用选择规则：库存为 0 的商品不能勾选
const handleGetSelectable = (row: Product): boolean => {
  return row.stock > 0
}

const onRowClick = (row: Product) => {
  console.log('点击行', row)
}

const handleSelectionChange = (rows: Product[]) => {
  console.log('选中数据', rows)
}

const handleEdit = (row: Product) => {
  console.log('编辑', row)
}

const handleDelete = (row: Product) => {
  console.log('删除', row.id)
}

// 请求数据
const fetchData = async () => {
  tableLoading.value = true
  try {
    // 实际项目中替换为真实接口调用
    // const res = await getProductList()
    // tableData.value = res.data

    // 模拟数据
    setTimeout(() => {
      tableData.value = [
        { id: 1, name: 'iPhone 15', price: 5999, stock: 20, desc: '苹果手机' },
        { id: 2, name: '小米14', price: 3999, stock: 0, desc: '库存为0，禁用选择' },
        { id: 3, name: '华为Mate60', price: 4999, stock: 12, desc: '华为手机' },
      ]
      tableLoading.value = false
    }, 800)
  } catch (e) {
    tableLoading.value = false
  }
}

fetchData()
</script>
```

### 单选模式

只需要把 `selection-type` 改为 `radio`：

```vue
<template>
  <BaseTable
    :columns="columns"
    :table-data="tableData"
    row-key="id"
    selection-type="radio"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup lang="ts">
import BaseTable, { type TableColumn } from '@/components/BaseTable/index.vue'

interface Product {
  id: number
  name: string
  price: number
}

const tableData = [
  { id: 1, name: 'iPhone 15', price: 5999 },
  { id: 2, name: '小米14', price: 3999 },
]

const columns: TableColumn<Product>[] = [
  { key: 'id', label: '商品ID', width: 80 },
  { key: 'name', label: '商品名称', width: '220' },
  { key: 'price', label: '售价', width: '120px' },
]

// 单选模式下，数组中只有一个元素，即当前选中行
const handleSelectionChange = (rows: Product[]) => {
  const selected = rows[0]
  console.log('当前选中：', selected)
}
</script>
```

---

## ⚠️ 注意事项与常见坑

### 1. 操作按钮必须加 `@click.stop`

操作列里的按钮点击会冒泡触发行点击事件，必须加 `.stop` 修饰符阻止冒泡：

```vue
<!-- ❌ 错误：点编辑会同时触发 row-click -->
<template #operate="{ row }">
  <button @click="handleEdit(row)">编辑</button>
</template>

<!-- ✅ 正确：阻止冒泡 -->
<template #operate="{ row }">
  <button @click.stop="handleEdit(row)">编辑</button>
</template>
```

### 2. 固定列必须指定宽度

`fixed` 固定列基于 `position: sticky` 实现，**必须给列设置 `width`**，否则固定列偏移计算不准，会出现错位。

```ts
// ❌ 错误：固定列没有宽度
{ key: 'id', label: 'ID', fixed: 'left' }

// ✅ 正确：固定列指定宽度
{ key: 'id', label: 'ID', width: 80, fixed: 'left' }
```

### 3. getSelectable 不禁用行点击

`getSelectable` 仅控制复选框 / 单选框的禁用状态，**不会禁用行点击事件**。如果需要同时禁用行点击，在 `row-click` 回调中自行判断：

```ts
const onRowClick = (row: Product) => {
  if (row.stock <= 0) return  // 禁用行不响应点击
  console.log('点击行', row)
}
```

### 4. 全选只操作可选择的行

开启 `getSelectable` 后，点击表头全选框，只会勾选**允许选择**的行，禁用行不受影响。

### 5. 多个表格同时使用单选

单选模式使用 `radio` 原生控件，组件内部自动生成唯一的 `name` 分组，多个表格的单选不会互相干扰。

### 6. 表头背景色必须设置

`sticky` 固定的表头必须设置 `background-color`，否则滚动时表体文字会从表头下方透出来，造成视觉重叠。组件内部已默认设置，如需自定义主题色注意保留背景色。

---

## 🔧 常见报错排查

### 报错：`不能将类型 "ApiResponse<Product[]>" 分配给类型 "Product[]"`

**原因**：接口返回的是 `{ code, data, msg }` 包装对象，直接赋值给数组类型不匹配。

**解决**：取 `.data` 再赋值：

```ts
const res = await getProductList()
if (res.code === 200) {
  tableData.value = res.data  // ✅ res.data 才是数组
}
```

### 报错：`类型 "AxiosResponse<...>" 上不存在属性 "code"`

**原因**：axios 响应拦截器没有 `return response.data`，TS 仍认为返回的是 Axios 原生对象。

**解决**：确保拦截器剥掉外层，并在封装时显式标注返回类型：

```ts
// request.ts 拦截器
request.interceptors.response.use(
  (response) => response.data,  // ✅ 必须 return
  (error) => Promise.reject(error)
)

// get 封装强制返回 Promise<T>
export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request.get(url, config) as unknown as Promise<T>
}
```

### 报错：`已声明 "T"，但从未读取其值`

**原因**：`TableColumn<T>` 定义了泛型但接口内部没有使用。

**解决**：增加 `render` 函数属性使用泛型，或暂时去掉泛型：

```ts
// ✅ 方案1：增加 render 使用 T
export interface TableColumn<T = Record<string, any>> {
  key: string
  label: string
  width?: number | string
  fixed?: 'left' | 'right' | false
  render?: (row: T, column: TableColumn<T>) => string | VNode
}

// ✅ 方案2：暂时不用泛型
export interface TableColumn {
  key: string
  label: string
  width?: number | string
  fixed?: 'left' | 'right' | false
}
```

### 问题：固定列横向滚动时文字重叠

**原因**：固定列没有设置背景色，下方内容透上来了。

**解决**：组件内部已默认设置 `background: '#fff'`，如果自定义样式覆盖了背景，务必补回背景色。

### 问题：点击复选框同时触发了行点击

**原因**：复选框在 `<td>` 内，点击会冒泡到 `<tr>` 的 `@click`。

**解决**：组件内部选择列已加 `@click.stop`，如果你在自定义插槽里放了复选框，记得自己加 `.stop`。

---

## 🔧 组件源码

### BaseTable/index.vue

```vue
<template>
  <div class="base-table-container" :style="{ maxHeight: containerHeight }">
    <!-- loading遮罩 -->
    <div v-if="loading" class="base-table-loading">
      <slot name="loading">加载中...</slot>
    </div>

    <table class="base-table">
      <thead>
        <tr>
          <!-- 多选/单选 选择列表头 -->
          <th
            v-if="selectionType"
            class="selection-col"
            :style="getThTdStyle(selectionColumn)"
          >
            <input
              v-if="selectionType === 'checkbox'"
              type="checkbox"
              v-model="isAllSelected"
              @change="handleSelectAll"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="getThTdStyle(column)"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in tableData"
          :key="row[rowKey]"
          @click="handleRowClick(row)"
          class="table-row"
        >
          <td
            v-if="selectionType"
            class="selection-col"
            :style="getThTdStyle(selectionColumn)"
            @click.stop
          >
            <input
              v-if="selectionType === 'checkbox'"
              type="checkbox"
              :checked="isRowSelected(row)"
              :disabled="!isRowSelectable(row)"
              @change="handleRowSelect(row)"
            />
            <input
              v-else-if="selectionType === 'radio'"
              type="radio"
              :checked="isRowSelected(row)"
              :disabled="!isRowSelectable(row)"
              @change="handleRowSelect(row)"
              :name="radioGroupName"
            />
          </td>
          <td
            v-for="column in columns"
            :key="column.key"
            :style="getThTdStyle(column)"
          >
            <slot :name="column.key" :row="row" :column="column">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 空数据提示 -->
    <div v-if="!loading && tableData.length === 0" class="base-table-empty">
      <slot name="empty">暂无数据</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType, CSSProperties, VNode } from 'vue'
import { ref, computed } from 'vue'

export interface TableColumn<T = Record<string, any>> {
  key: string
  label: string
  width?: number | string
  fixed?: 'left' | 'right' | false
  render?: (row: T, column: TableColumn<T>) => string | VNode
}

const props = defineProps({
  columns: {
    type: Array as PropType<TableColumn[]>,
    required: true,
  },
  tableData: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  containerHeight: {
    type: String,
    default: '400px',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectionType: {
    type: String as PropType<'' | 'checkbox' | 'radio'>,
    default: '',
  },
  getSelectable: {
    type: Function as PropType<(row: Record<string, any>) => boolean>,
    default: undefined,
  },
})

const emit = defineEmits<{
  'row-click': [row: Record<string, any>]
  'selection-change': [selectedRows: Record<string, any>[]]
}>()

const selectedRows = ref<Record<string, any>[]>([])
const radioGroupName = computed(() => `base-table-radio-${Date.now()}`)

const selectionColumn: TableColumn = {
  key: '__selection',
  label: '',
  width: '50px',
  fixed: 'left',
}

const isRowSelectable = (row: Record<string, any>): boolean => {
  if (!props.getSelectable) return true
  return props.getSelectable(row)
}

const isRowSelected = (row: Record<string, any>) => {
  return selectedRows.value.some(item => item[props.rowKey] === row[props.rowKey])
}

const handleRowSelect = (row: Record<string, any>) => {
  if (!isRowSelectable(row)) return

  if (props.selectionType === 'radio') {
    selectedRows.value = [row]
  } else {
    const idx = selectedRows.value.findIndex(
      item => item[props.rowKey] === row[props.rowKey]
    )
    if (idx > -1) {
      selectedRows.value.splice(idx, 1)
    } else {
      selectedRows.value.push(row)
    }
  }
  emit('selection-change', [...selectedRows.value])
}

const isAllSelected = computed({
  get() {
    const selectableRows = props.tableData.filter(row => isRowSelectable(row))
    if (selectableRows.length === 0) return false
    return selectableRows.every(row => isRowSelected(row))
  },
  set(val: boolean) {
    const selectableRows = props.tableData.filter(row => isRowSelectable(row))
    if (val) {
      selectedRows.value = [...selectableRows]
    } else {
      selectedRows.value = selectedRows.value.filter(r => !isRowSelectable(r))
    }
    emit('selection-change', [...selectedRows.value])
  },
})

const handleRowClick = (row: Record<string, any>) => {
  emit('row-click', row)
}

const getColumnWidth = (w?: number | string): string | undefined => {
  if (w === undefined || w === null) return undefined
  if (typeof w === 'number') {
    return `${w}px`
  }
  const str = w.trim()
  if (/^\d+$/.test(str)) {
    return `${str}px`
  }
  return str
}

const getWidthNumber = (w?: number | string): number => {
  const str = getColumnWidth(w)
  if (!str) return 0
  const match = str.match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

const getThTdStyle = (column: TableColumn): CSSProperties => {
  const style: CSSProperties = {
    width: getColumnWidth(column.width),
  }

  if (column.fixed === 'left') {
    style.position = 'sticky'
    style.left = calcLeftOffset(column)
    style.background = '#fff'
    style.zIndex = 3
  } else if (column.fixed === 'right') {
    style.position = 'sticky'
    style.right = calcRightOffset(column)
    style.background = '#fff'
    style.zIndex = 3
  }
  return style
}

const calcLeftOffset = (targetCol: TableColumn): string => {
  let offset = 0
  if (props.selectionType) {
    offset += getWidthNumber(selectionColumn.width)
  }
  for (const col of props.columns) {
    if (col.key === targetCol.key) break
    if (col.fixed === 'left') {
      offset += getWidthNumber(col.width)
    }
  }
  return `${offset}px`
}

const calcRightOffset = (targetCol: TableColumn): string => {
  let offset = 0
  let startSum = false
  for (let i = props.columns.length - 1; i >= 0; i--) {
    const col = props.columns[i]
    if (col.key === targetCol.key) {
      startSum = true
      continue
    }
    if (startSum && col.fixed === 'right') {
      offset += getWidthNumber(col.width)
    }
  }
  return `${offset}px`
}
</script>

<style scoped>
.base-table-container {
  border: 1px solid #e5e7eb;
  overflow: auto;
  position: relative;
}
.base-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}
.base-table thead th {
  position: sticky;
  top: 0;
  background-color: #f9fafb;
  z-index: 2;
}
.base-table thead th[style*='position: sticky'] {
  z-index: 4;
}
.base-table th,
.base-table td {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.selection-col {
  text-align: center;
  padding: 0 !important;
}
.table-row {
  cursor: pointer;
}
.base-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}
.base-table tbody tr:hover {
  background-color: #f0f7ff;
}
.base-table-empty {
  text-align: center;
  padding: 30px;
  color: #999;
}
.base-table-loading {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: #666;
}
</style>
```

---

## 📌 版本记录

| 版本 | 日期 | 变更内容 |
| ---- | ---- | ---- |
| v1.1 | 2026-09-08 | 移除分页组件相关内容，新增单选模式示例、常见报错排查小节 |
| v1.0 | 2026-09-08 | 初始版本：表头固定、左右固定列、多选/单选、禁用行选择、loading、行点击、空数据 |
