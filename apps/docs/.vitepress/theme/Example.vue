<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import buttonVariants from '../../src/examples/button-variants.vue?raw'
import buttonSizes from '../../src/examples/button-sizes.vue?raw'
import buttonSlots from '../../src/examples/button-slots.vue?raw'
import buttonStates from '../../src/examples/button-states.vue?raw'
import badgeVariants from '../../src/examples/badge-variants.vue?raw'
import separatorOrientation from '../../src/examples/separator-orientation.vue?raw'
import cardAppearance from '../../src/examples/card-appearance.vue?raw'
import inputStates from '../../src/examples/input-states.vue?raw'
import labelRequired from '../../src/examples/label-required.vue?raw'
import switchSizes from '../../src/examples/switch-sizes.vue?raw'
import switchThumbSlot from '../../src/examples/switch-thumb-slot.vue?raw'
import dropdownMenuItems from '../../src/examples/dropdown-menu-items.vue?raw'
import dropdownMenuSelection from '../../src/examples/dropdown-menu-selection.vue?raw'
import tooltipSides from '../../src/examples/tooltip-sides.vue?raw'
import dialogBasic from '../../src/examples/dialog-basic.vue?raw'
import tabsBasic from '../../src/examples/tabs-basic.vue?raw'
import toastVariants from '../../src/examples/toast-variants.vue?raw'
import toastStacking from '../../src/examples/toast-stacking.vue?raw'
import statBasic from '../../src/examples/stat-basic.vue?raw'
import statFigure from '../../src/examples/stat-figure.vue?raw'
import sparklineTone from '../../src/examples/sparkline-tone.vue?raw'
import sparklineEdges from '../../src/examples/sparkline-edges.vue?raw'
import themeSwitcherBasic from '../../src/examples/theme-switcher-basic.vue?raw'
import motionInspector from '../../src/examples/motion-inspector.vue?raw'
import textareaStates from '../../src/examples/textarea-states.vue?raw'
import checkboxStates from '../../src/examples/checkbox-states.vue?raw'
import radioGroupBasic from '../../src/examples/radio-group-basic.vue?raw'
import selectBasic from '../../src/examples/select-basic.vue?raw'
import sliderRange from '../../src/examples/slider-range.vue?raw'
import popoverBasic from '../../src/examples/popover-basic.vue?raw'
import alertDialogBasic from '../../src/examples/alert-dialog-basic.vue?raw'
import sheetSides from '../../src/examples/sheet-sides.vue?raw'
import accordionBasic from '../../src/examples/accordion-basic.vue?raw'
import breadcrumbBasic from '../../src/examples/breadcrumb-basic.vue?raw'
import paginationBasic from '../../src/examples/pagination-basic.vue?raw'
import alertVariants from '../../src/examples/alert-variants.vue?raw'
import progressStates from '../../src/examples/progress-states.vue?raw'
import skeletonCard from '../../src/examples/skeleton-card.vue?raw'
import avatarSizes from '../../src/examples/avatar-sizes.vue?raw'
import tableBasic from '../../src/examples/table-basic.vue?raw'
import toggleVariants from '../../src/examples/toggle-variants.vue?raw'
import commandBasic from '../../src/examples/command-basic.vue?raw'
import areaChartSeries from '../../src/examples/area-chart-series.vue?raw'

const props = defineProps<{
  /** File name inside `src/examples`, without the extension. */
  name: string
}>()

// `import.meta.glob` with a `?raw` query resolves to nothing inside VitePress'
// SSR build, so the example sources are imported one by one instead.
const sources: Record<string, string> = {
  'button-variants': buttonVariants,
  'button-sizes': buttonSizes,
  'button-slots': buttonSlots,
  'button-states': buttonStates,
  'badge-variants': badgeVariants,
  'separator-orientation': separatorOrientation,
  'card-appearance': cardAppearance,
  'input-states': inputStates,
  'label-required': labelRequired,
  'switch-sizes': switchSizes,
  'switch-thumb-slot': switchThumbSlot,
  'dropdown-menu-items': dropdownMenuItems,
  'dropdown-menu-selection': dropdownMenuSelection,
  'tooltip-sides': tooltipSides,
  'dialog-basic': dialogBasic,
  'tabs-basic': tabsBasic,
  'toast-variants': toastVariants,
  'toast-stacking': toastStacking,
  'stat-basic': statBasic,
  'stat-figure': statFigure,
  'sparkline-tone': sparklineTone,
  'sparkline-edges': sparklineEdges,
  'theme-switcher-basic': themeSwitcherBasic,
  'motion-inspector': motionInspector,
  'textarea-states': textareaStates,
  'checkbox-states': checkboxStates,
  'radio-group-basic': radioGroupBasic,
  'select-basic': selectBasic,
  'slider-range': sliderRange,
  'popover-basic': popoverBasic,
  'alert-dialog-basic': alertDialogBasic,
  'sheet-sides': sheetSides,
  'accordion-basic': accordionBasic,
  'breadcrumb-basic': breadcrumbBasic,
  'pagination-basic': paginationBasic,
  'alert-variants': alertVariants,
  'progress-states': progressStates,
  'skeleton-card': skeletonCard,
  'avatar-sizes': avatarSizes,
  'table-basic': tableBasic,
  'toggle-variants': toggleVariants,
  'command-basic': commandBasic,
  'area-chart-series': areaChartSeries,
}

type CodeToken = {
  text: string
  cls?: string
}

const TOKEN_PATTERN =
  /(<!--[\s\S]*?-->|\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|<\/?[A-Za-z][A-Za-z0-9-]*|\b(?:import|from|export|const|let|function|async|await|return|if|else|type|true|false|null|undefined)\b)/g

function tokenizeVue(code: string): CodeToken[] {
  const result: CodeToken[] = []
  let lastIndex = 0
  TOKEN_PATTERN.lastIndex = 0
  let match = TOKEN_PATTERN.exec(code)
  while (match) {
    if (match.index > lastIndex) {
      result.push({ text: code.slice(lastIndex, match.index) })
    }
    const value = match[0]
    let cls: string | undefined
    if (value.startsWith('<!--') || value.startsWith('//') || value.startsWith('/*')) {
      cls = 'text-ink-faint'
    } else if (value.startsWith("'") || value.startsWith('"') || value.startsWith('`')) {
      cls = 'text-danger'
    } else if (value.startsWith('<')) {
      cls = 'text-accent'
    } else {
      cls = 'font-medium text-accent'
    }
    result.push({ text: value, cls })
    lastIndex = match.index + value.length
    match = TOKEN_PATTERN.exec(code)
  }
  if (lastIndex < code.length) {
    result.push({ text: code.slice(lastIndex) })
  }
  return result
}

const source = computed(() => sources[props.name] ?? `<!-- example ${props.name}.vue not found -->`)
const tokens = computed(() => tokenizeVue(source.value))

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined

async function copySource(): Promise<void> {
  try {
    await navigator.clipboard.writeText(source.value)
    copied.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // Clipboard access may be unavailable in insecure contexts.
  }
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <div class="example-surface my-4">
    <slot />
  </div>
  <details class="my-4 overflow-hidden rounded-panel border border-line bg-raised">
    <summary
      class="flex cursor-pointer items-center justify-between px-4 py-2 text-[13px] font-medium text-ink-muted select-none hover:text-ink"
    >
      <span>Source</span>
      <button
        type="button"
        class="rounded-[8px] px-2 py-0.5 text-[12px] font-medium text-ink-muted hover:bg-control hover:text-ink"
        @click.stop.prevent="copySource"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </summary>
    <pre
      class="m-0 overflow-auto border-t border-line bg-raised px-4 py-3 font-mono text-[12px] leading-relaxed text-ink"
    ><code><span
      v-for="(token, index) in tokens"
      :key="index"
      :class="token.cls"
    >{{ token.text }}</span></code></pre>
  </details>
</template>
