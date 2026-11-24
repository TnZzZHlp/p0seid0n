import { onMounted, onBeforeUnmount, ref, useTemplateRef } from 'vue'

const minThumbSize = 28

export function useViewportScrollbar() {
  const track = useTemplateRef<HTMLDivElement>('track')
  const thumb = useTemplateRef<HTMLDivElement>('thumb')
  const scrollable = ref(false)
  const dragging = ref(false)
  let scroller: Element | null = null
  let maxScroll = 0
  let thumbSize = 0
  let travel = 0
  let frame = 0
  let observer: ResizeObserver | undefined
  let drag: { pointerId: number; offset: number } | undefined

  function updatePosition() {
    frame = 0
    if (!scroller || !thumb.value || maxScroll <= 0) return
    const fraction = Math.min(1, Math.max(0, scroller.scrollTop / maxScroll))
    thumb.value.style.translate = `0 ${fraction * travel}px`
  }

  function schedulePosition() {
    if (!frame) frame = window.requestAnimationFrame(updatePosition)
  }

  function measure() {
    if (!scroller || !track.value || !thumb.value) return
    const viewport = document.documentElement.clientHeight
    const content = scroller.scrollHeight
    const height = track.value.clientHeight
    maxScroll = Math.max(0, content - viewport)
    thumbSize = content > 0 ? Math.min(height, Math.max(minThumbSize, height * viewport / content)) : height
    travel = height - thumbSize
    scrollable.value = maxScroll > 0 && travel > 0
    thumb.value.style.blockSize = `${thumbSize}px`
    schedulePosition()
  }

  function scrollToPointer(clientY: number) {
    if (!scroller || !track.value || !drag || travel <= 0) return
    const offset = clientY - track.value.getBoundingClientRect().top - drag.offset
    const fraction = Math.min(1, Math.max(0, offset / travel))
    scroller.scrollTo({ top: fraction * maxScroll, behavior: 'instant' })
  }

  function startDrag(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0 || drag || !scrollable.value || !scroller || !track.value || !thumb.value) return
    if ([scroller, document.body].some((element) => /^(hidden|clip)$/.test(getComputedStyle(element).overflowY))) return

    const onThumb = thumb.value.contains(event.target as Node)
    drag = {
      pointerId: event.pointerId,
      offset: onThumb ? event.clientY - thumb.value.getBoundingClientRect().top : thumbSize / 2,
    }
    event.preventDefault()
    track.value.setPointerCapture(event.pointerId)
    dragging.value = true
    if (!onThumb) scrollToPointer(event.clientY)
  }

  function moveDrag(event: PointerEvent) {
    if (drag?.pointerId === event.pointerId) scrollToPointer(event.clientY)
  }

  function stopDrag(event: PointerEvent) {
    if (drag?.pointerId !== event.pointerId) return
    drag = undefined
    dragging.value = false
  }

  onMounted(() => {
    scroller = document.scrollingElement
    if (!scroller || !track.value) return
    observer = new ResizeObserver(measure)
    observer.observe(document.body)
    observer.observe(track.value)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', schedulePosition, { passive: true })
    measure()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    window.cancelAnimationFrame(frame)
    window.removeEventListener('resize', measure)
    window.removeEventListener('scroll', schedulePosition)
  })

  return { scrollable, dragging, startDrag, moveDrag, stopDrag }
}
