/**
 * The dialog close control mirrors the ghost button: transparent until hovered,
 * ink icon, 2px focus ring at 2px offset.
 */
export const closeButton = [
  'absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-[10px]',
  'text-[16px] leading-none text-ink-muted',
  'hover:bg-control hover:text-ink',
  'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ink',
  'transition-[background-color,color] duration-150 motion-reduce:transition-none',
].join(' ')
