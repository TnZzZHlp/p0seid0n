/**
 * The trigger strip is a control-height track: 4px inset, 10px item radius, and a
 * raised fill on the active trigger so it reads as the selected segment.
 */
export const tabList = [
  'inline-flex items-center gap-1 rounded-control bg-control p-1',
  'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
].join(' ')

export const tabTrigger = [
  'inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-3',
  'text-[13px] font-medium text-ink-muted',
  'hover:text-ink',
  'data-[state=active]:bg-raised data-[state=active]:text-ink data-[state=active]:shadow-sm',
  'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ink',
  'transition-[background-color,color,box-shadow] duration-150 motion-reduce:transition-none',
  'disabled:pointer-events-none disabled:opacity-55',
].join(' ')

export const tabPanel = 'mt-4 text-[14px] text-ink-muted outline-none'
