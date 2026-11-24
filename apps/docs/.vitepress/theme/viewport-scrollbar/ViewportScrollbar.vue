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
  inline-size: var(--docs-scrollbar-size);
  border-radius: var(--docs-scrollbar-radius);
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
  background: var(--docs-scrollbar-track-hover);
}

.viewport-scrollbar-thumb {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 3px;
  border-radius: inherit;
  background: var(--docs-scrollbar-thumb);
}

.viewport-scrollbar:hover .viewport-scrollbar-thumb,
.viewport-scrollbar[data-dragging] .viewport-scrollbar-thumb {
  background: var(--docs-scrollbar-thumb-hover);
}
</style>
