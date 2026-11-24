<script setup lang="ts">
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToastProvider, useToast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const slowMotion = ref(false)
const tab = ref('enter')
const dialogOpen = ref(false)
const pinned = ref(true)
let toastIndex = 0

const DURATION_TOKENS = [
  ['--p0seid0n-duration-fast', '480ms'],
  ['--p0seid0n-duration-normal', '640ms'],
  ['--p0seid0n-duration-slow', '800ms'],
] as const

function syncSpeed(slow: boolean): void {
  const root = document.documentElement
  for (const [token, slowValue] of DURATION_TOKENS) {
    if (slow) root.style.setProperty(token, slowValue)
    else root.style.removeProperty(token)
  }
}

watch(slowMotion, (next) => {
  syncSpeed(next)
})

onBeforeUnmount(() => {
  syncSpeed(false)
})

const ToastLauncher = defineComponent({
  name: 'MotionToastLauncher',
  setup() {
    const { toast } = useToast()
    return () =>
      h(
        Button,
        {
          variant: 'secondary',
          size: 'sm',
          onClick: () => {
            toastIndex += 1
            toast({
              title: `Probe #${toastIndex} finished`,
              description: 'Stack items glide into place on enter and dismiss.',
              variant: toastIndex % 2 === 0 ? 'success' : 'default',
            })
          },
        },
        () => 'Push toast',
      )
  },
})
</script>

<template>
  <ToastProvider>
    <div class="space-y-5">
      <div class="flex flex-wrap items-center gap-3">
        <label
          class="inline-flex cursor-pointer items-center gap-2.5 text-[14px] font-medium text-ink"
        >
          <Switch v-model="slowMotion" aria-label="4x slow motion" />
          <span>4x slow motion</span>
        </label>
        <Badge :variant="slowMotion ? 'accent' : 'outline'">
          {{ slowMotion ? '480 / 640 / 800ms' : '120 / 160 / 200ms' }}
        </Badge>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <Button size="sm">Press detent</Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="secondary" size="sm">Directional menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem v-model="pinned">Pin readout</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Export JSON</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip :delay="80">
          <TooltipTrigger as-child>
            <Button variant="secondary" size="sm">Hover tip</Button>
          </TooltipTrigger>
          <TooltipContent side="top" shortcut="K">Origin-aware pop</TooltipContent>
        </Tooltip>

        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button variant="secondary" size="sm">Open modal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Modal enter and exit</DialogTitle>
            <DialogDescription>
              Both the backdrop and the panel animate on open and suspend unmounting until the exit
              keyframe completes.
            </DialogDescription>
            <div class="mt-5 flex justify-end">
              <DialogClose as-child>
                <Button size="sm">Done</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        <ToastLauncher />
      </div>

      <Tabs v-model="tab" class="max-w-md">
        <TabsList>
          <TabsTrigger value="enter">Enter</TabsTrigger>
          <TabsTrigger value="indicator">Sliding pill</TabsTrigger>
          <TabsTrigger value="exit">Exit</TabsTrigger>
        </TabsList>
        <TabsContent value="enter">
          Floating layers scale from 0.96 around their Popper transform-origin and offset 4px toward
          the trigger side.
        </TabsContent>
        <TabsContent value="indicator">
          TabsIndicator measures the active trigger after hydration and glides horizontally or
          vertically without flashing on first paint.
        </TabsContent>
        <TabsContent value="exit">
          Paired exit keyframes let ui-sdk finish animating before removing nodes from the DOM.
        </TabsContent>
      </Tabs>
    </div>
  </ToastProvider>
</template>
