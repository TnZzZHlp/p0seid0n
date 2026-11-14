/**
 * Shared surface for every floating layer, taken from the reference menu styles:
 * 16px radius, 1px line border, popup shadow and a 6px inset so items keep their
 * own 10px radius from touching the edge.
 */
export const popupSurface = [
  'z-10 overflow-hidden rounded-panel border border-line bg-raised p-1.5 shadow-popup',
  'outline-none',
].join(' ')

export const menuItem = [
  'relative flex h-9 cursor-pointer select-none items-center gap-2 rounded-[10px] px-3',
  'text-[14px] font-medium text-ink-muted outline-none',
  'hover:bg-control hover:text-ink',
  'focus:bg-control focus:text-ink',
  'data-[highlighted]:bg-control data-[highlighted]:text-ink',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-55',
].join(' ')

export const menuLabel = 'px-3 py-1.5 text-[12px] font-medium text-ink-faint'

export const menuSeparator = 'my-1 h-px bg-line'
