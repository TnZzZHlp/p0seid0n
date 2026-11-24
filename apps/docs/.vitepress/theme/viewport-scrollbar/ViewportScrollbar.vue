<script setup lang="ts">
import { useViewportScrollbar } from './useViewportScrollbar'

const { scrollable, dragging, startDrag, moveDrag, stopDrag } = useViewportScrollbar()
</script>

<template>
  <div
    ref="track"
    class="viewport-scrollbar"
    :data-scrollable="scrollable ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    aria-hidden="true"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="stopDrag"
    @pointercancel="stopDrag"
    @lostpointercapture="stopDrag"
  >
    <div ref="thumb" class="viewport-scrollbar-thumb" />
  </div>
</template>

<style scoped>
.viewport-scrollbar {
  display: none;
  position: fixed;
  inset-block: 4px;
  inset-inline-end: 0;
  z-index: 39;
  inline-size: 12px;
  border-radius: 999px;
  visibility: hidden;
  touch-action: none;
}

@media (forced-colors: none) and (scripting: enabled) {
  .viewport-scrollbar {
    display: block;
  }
}

.viewport-scrollbar[data-scrollable] {
  visibility: visible;
}

.viewport-scrollbar:hover,
.viewport-scrollbar[data-dragging] {
  background: color-mix(in oklab, var(--p0seid0n-ink) 8%, transparent);
}

.viewport-scrollbar-thumb {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 3px;
  border-radius: inherit;
  background: var(--p0seid0n-ink-muted);
  opacity: 0.65;
}

.viewport-scrollbar:hover .viewport-scrollbar-thumb,
.viewport-scrollbar[data-dragging] .viewport-scrollbar-thumb {
  opacity: 1;
}
</style>
