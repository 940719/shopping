<!-- BaseTooltip.vue -->
<template>
    <Teleport to="body">
        <div v-if="show" ref="tipDomRef" class="base-tooltip" :class="[theme, placementClass]"
            :style="[tooltipPos, { maxWidth: `${maxWidth}px` }]" role="tooltip">
            <span class="base-tooltip-content">{{ content }}</span>
            <span class="base-tooltip-arrow"></span>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, type PropType, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    content: {
        type: String,
        default: ''
    },
    theme: {
        type: String as PropType<'dark' | 'light'>,
        default: 'dark'
    },
    triggerRect: {
        type: Object as PropType<DOMRect>,
        default: () => ({})
    },
    maxWidth: {
        type: Number,
        default: 320
    }
})

const tipDomRef = ref<HTMLDivElement | null>(null)
const tooltipPos = ref<Record<string, string>>({})
const placementClass = ref<'placement-top' | 'placement-bottom'>('placement-top')

const calcPosition = async () => {
    if (!props.triggerRect || !props.show || !tipDomRef.value) return
    await nextTick()
    const tipDom = tipDomRef.value
    const tipW = tipDom.offsetWidth
    const tipH = tipDom.offsetHeight
    const gap = 12 // element默认间距

    const rect = props.triggerRect
    const winW = window.innerWidth

    let top = rect.top - tipH - gap
    let left = rect.left + rect.width / 2 - tipW / 2

    // 顶部放不下，切换到底部
    if (top < 12) {
        placementClass.value = 'placement-bottom'
        top = rect.bottom + gap
    } else {
        placementClass.value = 'placement-top'
    }

    // 左右边界限制
    if (left < 12) {
        left = 12
    } else if (left + tipW > winW - 12) {
        left = winW - tipW - 12
    }

    tooltipPos.value = {
        top: `${top}px`,
        left: `${left}px`,
    }
}

watch(() => props.show, (v) => {
    if (v) {
        nextTick(calcPosition)
    }
})

const onResize = () => calcPosition()
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
/* 完全复刻 Element Plus tooltip 样式 */
.base-tooltip {
    position: fixed;
    z-index: 9999;
    padding: 8px 12px;
    border-radius: 4px;
    pointer-events: none;
    white-space: normal;
    word-break: break-all;
    font-size: 14px;
}

/* dark 黑色主题（默认，element dark tooltip） */
.base-tooltip.dark {
    background-color: #303133;
    color: #ffffff;
    --arrow-bg: #303133;
}

/* light白色主题 */
.base-tooltip.light {
    background-color: #ffffff;
    color: #303133;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    --arrow-bg: #fff;
}

.base-tooltip-content {
    display: block;
}

.base-tooltip-arrow {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border: 6px solid transparent;
}

/* placement-top：tooltip 在元素上方，箭头向下指向元素（Element原版） */
.placement-top .base-tooltip-arrow {
    bottom: -4px;
    border-top-color: var(--arrow-bg);
    border-bottom: 0;
}

/* placement-bottom：tooltip 在元素下方，箭头向上指向元素（Element原版） */
.placement-bottom .base-tooltip-arrow {
    top: -4px;
    border-bottom-color: var(--arrow-bg);
    border-top: 0;
}
</style>
