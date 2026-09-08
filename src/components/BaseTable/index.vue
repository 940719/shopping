<template>
  <div class="base-table-container" :style="{ maxHeight: containerHeight }">
    <div v-if="loading" class="base-table-loading">
      <slot name="loading">加载中...</slot>
    </div>

    <table class="base-table">
      <thead>
        <tr>
          <th
            v-if="selectionType"
            class="selection-col"
            :style="getThTdStyle(selectionColumn)"
          >
            <input
              v-if="selectionType === 'checkbox'"
              type="checkbox"
              v-model="isAllSelected"
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
          v-for="(row, rowIndex) in tableData"
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
            v-for="(column, colIndex) in columns"
            :key="column.key"
            :style="getThTdStyle(column)"
            class="cell-wrap"
            @mouseenter="handleCellEnter($event, rowIndex, colIndex, row[column.key])"
            @mouseleave="handleCellLeave"
          >
            <slot :name="column.key" :row="row" :column="column">
              <span
                v-if="column.showTooltip"
                class="cell-text"
               :ref="(el) => setCellRef(el, rowIndex, colIndex)"
              >
                {{ row[column.key] }}
              </span>
              <span v-else>{{ row[column.key] }}</span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && tableData.length === 0" class="base-table-empty">
      <slot name="empty">暂无数据</slot>
    </div>
  </div>

  <!-- Teleport 挂载body -->
  <Teleport to="body">
    <div
      class="custom-tooltip"
      :class="tooltipTheme"
      :style="{
        left: tooltip.left + 'px',
        top: tooltip.top + 'px',
        opacity: tooltip.show ? 1 : 0,
        visibility: tooltip.show ? 'visible' : 'hidden',
      }"
    >
      {{ tooltip.content }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { PropType, CSSProperties, VNode ,ComponentPublicInstance} from 'vue'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export interface TableColumn<T = Record<string, any>> {
  key: string
  label: string
  width?: number | string
  fixed?: 'left' | 'right' | false
  render?: (row: T, column: TableColumn<T>) => string | VNode
  showTooltip?: boolean
}

const props = defineProps({
  columns: {
    type: Array as PropType<TableColumn[]>,
    required: true
  },
  tableData: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => []
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  containerHeight: {
    type: String,
    default: '400px'
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectionType: {
    type: String as PropType<'' | 'checkbox' | 'radio'>,
    default: ''
  },
  getSelectable: {
    type: Function as PropType<(row: Record<string, any>) => boolean>,
    default: undefined
  },
  tooltipTheme: {
    type: String as PropType<'dark' | 'light'>,
    default: 'dark'
  }
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
  fixed: 'left'
}

const cellRefs = ref<Map<string, HTMLElement>>(new Map())
const overflowMap = ref<Map<string, boolean>>(new Map())
let resizeObserver: ResizeObserver | null = null

const tooltip = ref({
  show: false,
  left: 0,
  top: 0,
  content: ''
})

const setCellRef = (el: Element | ComponentPublicInstance | null, rowIndex: number, colIndex: number) => {
 // 类型守卫：判断是不是HTMLElement
  if (el instanceof HTMLElement) {
    const key = `${rowIndex}-${colIndex}`
    cellRefs.value.set(key, el)
    checkCellOverflow(el, key)
  } else {
    const key = `${rowIndex}-${colIndex}`
    cellRefs.value.delete(key)
    overflowMap.value.delete(key)
  }
}

const checkCellOverflow = (el: HTMLElement, key: string) => {
  const isOverflow = el.scrollWidth > el.clientWidth
  overflowMap.value.set(key, isOverflow)
}

const isCellOverflow = (rowIndex: number, colIndex: number): boolean => {
  const key = `${rowIndex}-${colIndex}`
  return overflowMap.value.get(key) ?? false
}

// 固定向上弹出，不再向下切换
const handleCellEnter = (e: MouseEvent, rowIndex: number, colIndex: number, content: string) => {
  const overflow = isCellOverflow(rowIndex, colIndex)
  console.log('是否溢出：', overflow, content)
  if (!overflow) return

  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  tooltip.value = {
    show: true,
    // 水平居中
    left: rect.left + rect.width / 2,
    // 放在单元格上方，预留8px间距
    top: rect.top - 28,
    content
  }
}
const handleCellLeave = () => {
  tooltip.value.show = false
}

watch(
  () => props.tableData,
  () => {
    cellRefs.value.forEach((el, key) => checkCellOverflow(el, key))
  },
  { deep: true }
)

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement
      for (const [key, dom] of cellRefs.value.entries()) {
        if (dom === el) {
          checkCellOverflow(el, key)
          break
        }
      }
    }
  })
  cellRefs.value.forEach((el) => {
    resizeObserver?.observe(el)
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

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
    const idx = selectedRows.value.findIndex(item => item[props.rowKey] === row[props.rowKey])
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
  }
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
    width: getColumnWidth(column.width)
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
.base-table thead th[style*="position: sticky"] {
  z-index: 4;
}
.base-table th,
.base-table td {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  text-align: left;
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
.cell-text {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

<!-- 全局样式，不要scoped，修复箭头 -->
<style>
.custom-tooltip {
  position: fixed;
  transform: translateX(-50%);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 99999 !important;
  pointer-events: none;
  transition: opacity 0.15s ease;
}
/* 箭头 向下指向文字 */
.custom-tooltip::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  border: 6px solid transparent;
}

/* dark主题 */
.custom-tooltip.dark {
  background: #303133;
  color: #fff;
}
.custom-tooltip.dark::after {
  border-top-color: #303133;
}

/* light主题 */
.custom-tooltip.light {
  background: #ffffff;
  color: #303133;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
}
.custom-tooltip.light::after {
  border-top-color: #ffffff;
}
</style>
