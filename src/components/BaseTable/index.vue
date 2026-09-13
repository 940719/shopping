<template>
  <div class="base-table-container" :style="{ maxHeight: containerHeight }">
    <div v-if="loading" class="base-table-loading">
      <slot name="loading">加载中...</slot>
    </div>

    <table class="base-table">
      <thead>
        <tr>
          <th v-if="selectionType" class="selection-col" :style="getThTdStyle(selectionColumn)">
            <input v-if="selectionType === 'checkbox'" type="checkbox" v-model="isAllSelected" />
          </th>
          <th v-for="column in columns" :key="column.key" :style="getThTdStyle(column)">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row) in tableData" :key="row[rowKey]" @click="handleRowClick(row)" class="table-row">
          <td v-if="selectionType" class="selection-col" :style="getThTdStyle(selectionColumn)" @click.stop>
            <input v-if="selectionType === 'checkbox'" type="checkbox" :checked="isRowSelected(row)"
              @change="handleRowSelect(row)" :disabled="!isRowSelectable(row)" />
            <input v-else-if="selectionType === 'radio'" type="radio" :checked="isRowSelected(row)"
              @change="handleRowSelect(row)" :disabled="!isRowSelectable(row)" :name="radioGroupName" />
          </td>
          <td v-for="(column) in columns" :key="column.key" :style="getThTdStyle(column)" class="cell-wrap">
            <slot :name="column.key" :row="row" :column="column">
              <span class="cell-text" @mouseenter="handleCellEnter($event, row[column.key])"
                @mouseleave="handleCellLeave">
                {{ row[column.key] }}
              </span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && tableData.length === 0" class="base-table-empty">
      <slot name="empty">暂无数据</slot>
    </div>
  </div>

  <Teleport to="body">
    <div class="custom-tooltip" :class="tooltipTheme" :style="{
      left: tooltip.left + 'px',
      top: tooltip.top + 'px',
      opacity: tooltip.show ? 1 : 0,
      visibility: tooltip.show ? 'visible' : 'hidden'
    }">
      {{ tooltip.content }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { PropType, CSSProperties, VNode } from 'vue'
import { ref, computed } from 'vue'

export interface TableColumn<T = Record<string, any>> {
  key: string
  label: string
  width?: string | number
  fixed?: 'left' | 'right' | false
  render?: (row: T, column: TableColumn<T>) => VNode
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
  'selection-change': [selectedList: Record<string, any>[]]
}>()

const selectedRows = ref<Record<string, any>[]>([])
const radioGroupName = computed(() => `table-radio-${Date.now()}`)

const selectionColumn: TableColumn = {
  key: '__selection',
  label: '',
  width: 50,
  fixed: 'left'
}

const tooltip = ref({
  show: false,
  left: 0,
  top: 0,
  content: ''
})

const handleCellEnter = (e: MouseEvent, content: string) => {
  const target = e.currentTarget as HTMLElement
  const isOverflow = target.scrollWidth > target.clientWidth
  console.log('是否溢出：', isOverflow, content)
  if (!isOverflow) return

  const rect = target.getBoundingClientRect()
  tooltip.value = {
    show: true,
    left: rect.left + rect.width / 2,
    top: rect.top - 40,
    content
  }
}
const handleCellLeave = () => {
  tooltip.value.show = false
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
    const selectableRows = props.tableData.filter(r => isRowSelectable(r))
    if (selectableRows.length === 0) return false
    return selectableRows.every(r => isRowSelected(r))
  },
  set(val: boolean) {
    if (val) {
      selectedRows.value = props.tableData.filter(r => isRowSelectable(r))
    } else {
      selectedRows.value = selectedRows.value.filter(r => !isRowSelectable(r))
    }
    emit('selection-change', [...selectedRows.value])
  }
})

const handleRowClick = (row: Record<string, any>) => {
  emit('row-click', row)
}

const getColumnWidth = (w?: string | number): string | undefined => {
  if (w === undefined || w === null) return undefined
  if (typeof w === 'number') return `${w}px`
  const str = w.trim()
  if (/^\d+$/.test(str)) return `${str}px`
  return str
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
    offset += Number(selectionColumn.width)
  }
  for (const col of props.columns) {
    if (col.key === targetCol.key) break
    if (col.fixed === 'left') {
      const w = col.width ?? 0
      offset += typeof w === 'number' ? w : Number(w.toString().replace('px', ''))
    }
  }
  return `${offset}px`
}

const calcRightOffset = (targetCol: TableColumn): string => {
  let offset = 0
  let start = false
  for (let i = props.columns.length - 1; i >= 0; i--) {
    const col = props.columns[i]
    if (col.key === targetCol.key) {
      start = true
      continue
    }
    if (start && col.fixed === 'right') {
      const w = col.width ?? 0
      offset += typeof w === 'number' ? w : Number(w.toString().replace('px', ''))
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

.table-row:nth-child(even) {
  background-color: #fafafa;
}

.table-row:hover {
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

<style>
.custom-tooltip {
  position: fixed;
  transform: translateX(-50%);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: normal;
  max-width: 320px;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
  z-index: 99999 !important;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.custom-tooltip::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  border: 6px solid transparent;
}

.custom-tooltip.dark {
  background: #303133;
  color: #fff;
}

.custom-tooltip.dark::after {
  border-top-color: #303133;
}

.custom-tooltip.light {
  background: #ffffff;
  color: #303133;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.custom-tooltip.light::after {
  border-top-color: #ffffff;
}
</style>
