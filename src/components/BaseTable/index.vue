<template>
  <div class="base-table-container" :style="{ maxHeight: containerHeight }">
    <div v-if="loading" class="base-table-loading">
      <slot name="loading">加载中...</slot>
    </div>

    <table class="base-table">
      <thead>
        <tr>
          <th v-if="selectionType" class="selection-col" :style="getThTdStyle(selectionColumn)">
            <input v-if="selectionType === 'checkbox'" type="checkbox" v-model="isAllSelected"
              @change="handleSelectAll" />
          </th>
          <th v-for="column in columns" :key="column.key" :style="getThTdStyle(column)">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in tableData" :key="row[rowKey]" @click="handleRowClick(row)"
          :class="{ 'row-disabled': getSelectable?.(row) === false }">
          <td v-if="selectionType" class="selection-col" :style="getThTdStyle(selectionColumn)" @click.stop>
            <input v-if="selectionType === 'checkbox'" type="checkbox" v-model="selectedKeys" :value="row[rowKey]"
              :disabled="getSelectable?.(row) === false" />
            <input v-else-if="selectionType === 'radio'" type="radio" v-model="selectedKeys" :value="row[rowKey]"
              :disabled="getSelectable?.(row) === false" />
          </td>

          <td v-for="column in columns" :key="column.key" :style="getThTdStyle(column)"
            @mouseenter="handleCellEnter($event, row, column)" @mouseleave="handleCellLeave">
            <span class="cell-text">
              {{ row[column.key] }}
            </span>
            <slot :name="`cell-${column.key}`" :row="row" :column="column" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Tooltip 组件，内部升级边界检测，对外无感知 -->
    <BaseTooltip :show="tooltipShow" :content="tooltipContent" :theme="tooltipTheme" :trigger-rect="tooltipRect"
      :maxWidth="500" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import BaseTooltip from '@/components/BaseTooltip/index.vue'

export interface TableColumn<T = Record<string, any>> {
  key: string,
  label: string,
  width?: number | string,
  fixed?: 'left' | 'right' | false,
  render?: (row: T) => string,
}

interface SelectionColumn {
  width: number | string,
}

const props = defineProps({
  tableData: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => [],
  },
  columns: {
    type: Array as PropType<TableColumn[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  containerHeight: {
    type: String,
    default: '500px',
  },
  selectionType: {
    type: String as PropType<'checkbox' | 'radio' | undefined>,
    default: undefined,
  },
  selectionColumn: {
    type: Object as PropType<SelectionColumn>,
    default: () => ({ width: '55px' }),
  },
  getSelectable: {
    type: Function as PropType<(row: Record<string, any>) => boolean>,
    default: undefined,
  },
  tooltipTheme: {
    type: String as PropType<'dark' | 'light'>,
    default: 'dark',
  },
  rowKey: {
    type: String,
    default: 'id',
  },
})

const emit = defineEmits(['row-click', 'selection-change'])

// 选中项
const selectedKeys = ref<(string | number)[]>([])

// 全选状态
const isAllSelected = computed({
  get() {
    const availableRows = props.tableData.filter(item => props.getSelectable?.(item) !== false)
    if (!availableRows.length) return false
    return availableRows.every(item => selectedKeys.value.includes(item[props.rowKey]))
  },
  set(val: boolean) {
    const availableRows = props.tableData.filter(item => props.getSelectable?.(item) !== false)
    if (val) {
      selectedKeys.value = availableRows.map(item => item[props.rowKey])
    } else {
      selectedKeys.value = []
    }
    emit('selection-change', selectedKeys.value)
  },
})

const handleSelectAll = () => {
  // computed setter 自动处理
}

const handleRowClick = (row: Record<string, any>) => {
  emit('row-click', row)
}

// ===== Tooltip 内部逻辑（边界检测升级，对外无感知）=====
const tooltipShow = ref(false)
const tooltipContent = ref('')
const tooltipRect = ref<DOMRect>()

const handleCellEnter = (e: MouseEvent, row: Record<string, any>, column: TableColumn) => {
  const el = e.currentTarget as HTMLElement
  const textEl = el.querySelector('.cell-text') as HTMLElement
  if (!textEl) return
  // 只有文本溢出才显示tooltip
  if (textEl.scrollWidth > textEl.clientWidth) {
    tooltipShow.value = true
    tooltipContent.value = String(row[column.key])
    tooltipRect.value = el.getBoundingClientRect()
    // 溢出单元格显示手掌
    el.style.cursor = 'pointer'
  }
}

const handleCellLeave = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement
  el.style.cursor = ''
  tooltipShow.value = false
}

// 列宽样式
const getThTdStyle = (col: { width?: number | string; fixed?: 'left' | 'right' | false }) => {
  const style: Record<string, string> = {}
  if (col.width) {
    style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
  }
  if (col.fixed === 'left') {
    style.position = 'sticky'
    style.left = '0'
    style.background = '#fff'
    style.zIndex = '2'
  }
  if (col.fixed === 'right') {
    style.position = 'sticky'
    style.right = '0'
    style.background = '#fff'
    style.zIndex = '2'
  }
  return style
}
</script>

<style scoped>
.base-table-container {
  overflow: auto;
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.base-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  /* 核心修复 */
}

.base-table th,
.base-table td {
  padding: 12px 8px;
  border: 1px solid #ebeef5;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
}

.cell-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-table thead tr {
  background-color: #fafafa;
}

.selection-col {
  width: 60px;
  position: sticky;
  left: 0;
  background: #fafafa;
  z-index: 3;
}

.base-table tbody tr:hover {
  background-color: #f5f7fa;
}

.row-disabled {
  color: #c0c4cc;
}

.base-table-loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}
</style>
