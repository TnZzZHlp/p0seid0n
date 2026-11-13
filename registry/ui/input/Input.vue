<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const forwarded = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  return rest
})

export type InputProps = {
  /** Marks the field as invalid and paints the border with the danger colour. */
  invalid?: boolean
  disabled?: boolean
  id?: string
}

withDefaults(defineProps<InputProps>(), {
  invalid: false,
  disabled: false,
  id: undefined,
})

const model = defineModel<string | number>({ default: '' })
const emit = defineEmits<{ input: [event: Event] }>()

function onInput(event: Event): void {
  model.value = (event.target as HTMLInputElement).value
  emit('input', event)
}
</script>

<template>
  <input
    v-bind="forwarded"
    :id="id"
    v-model="model"
    :disabled="disabled"
    :aria-invalid="invalid ? 'true' : undefined"
    :class="
      cn(
        'h-11 w-full rounded-control border border-line bg-control px-3 text-[15px] text-ink',
        'placeholder:text-ink-muted',
        'outline-none focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ink',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:outline-danger',
        'disabled:cursor-default disabled:opacity-55',
        'transition-[background-color,color,border-color,box-shadow] duration-150 motion-reduce:transition-none',
        $attrs.class as string | undefined,
      )
    "
    @input="onInput"
  />
</template>
