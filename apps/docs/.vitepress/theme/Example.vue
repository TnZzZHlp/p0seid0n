<script setup lang="ts">
import { computed } from 'vue'
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
import tooltipSides from '../../src/examples/tooltip-sides.vue?raw'
import dialogBasic from '../../src/examples/dialog-basic.vue?raw'
import tabsBasic from '../../src/examples/tabs-basic.vue?raw'
import toastVariants from '../../src/examples/toast-variants.vue?raw'
import toastStacking from '../../src/examples/toast-stacking.vue?raw'
import statBasic from '../../src/examples/stat-basic.vue?raw'
import statFigure from '../../src/examples/stat-figure.vue?raw'
import sparklineTone from '../../src/examples/sparkline-tone.vue?raw'
import sparklineEdges from '../../src/examples/sparkline-edges.vue?raw'

const props = defineProps<{
  /** File name inside `src/examples`, without the extension. */
  name: string
}>()

// `import.meta.glob` with a `?raw` query resolves to nothing inside VitePress'
// SSR build, so the example sources are imported one by one instead. Adding an
// example means adding a line here; the alternative was a code block that had to
// be kept in sync by hand, which the subplan explicitly rules out.
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
  'tooltip-sides': tooltipSides,
  'dialog-basic': dialogBasic,
  'tabs-basic': tabsBasic,
  'toast-variants': toastVariants,
  'toast-stacking': toastStacking,
  'stat-basic': statBasic,
  'stat-figure': statFigure,
  'sparkline-tone': sparklineTone,
  'sparkline-edges': sparklineEdges,
}

const source = computed(() => sources[props.name] ?? `<!-- example ${props.name}.vue not found -->`)
</script>

<template>
  <div class="example-surface my-4">
    <slot />
  </div>
  <details class="my-4 rounded-panel border border-line">
    <summary class="cursor-pointer px-4 py-2 text-[13px] font-medium text-ink-muted">Source</summary>
    <pre
      class="overflow-auto px-4 pb-4 text-[12px] leading-relaxed"
    ><code>{{ source }}</code></pre>
  </details>
</template>
