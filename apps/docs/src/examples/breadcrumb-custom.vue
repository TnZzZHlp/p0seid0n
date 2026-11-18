<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const trail = ['Network', 'Europe', 'Frankfurt (fra-01)']
const activeIndex = ref(2)
const visibleSegments = computed(() => trail.slice(0, activeIndex.value + 1))
</script>

<template>
  <div class="grid gap-3">
    <Breadcrumb aria-label="Region trail">
      <BreadcrumbList>
        <template v-for="(segment, index) in visibleSegments" :key="segment">
          <BreadcrumbSeparator v-if="index > 0">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m6 4 4 4-4 4" />
            </svg>
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink v-if="index < visibleSegments.length - 1" as-child>
              <button type="button" class="cursor-pointer" @click="activeIndex = index">
                {{ segment }}
              </button>
            </BreadcrumbLink>
            <BreadcrumbPage v-else>{{ segment }}</BreadcrumbPage>
          </BreadcrumbItem>
        </template>
      </BreadcrumbList>
    </Breadcrumb>
    <div class="flex items-center gap-3 text-[12px] text-ink-muted">
      <span
        >Active node:
        <strong class="font-medium text-ink">{{ trail[activeIndex] }}</strong></span
      >
      <button
        v-if="activeIndex < trail.length - 1"
        type="button"
        class="cursor-pointer rounded-[6px] border border-line bg-control px-2 py-0.5 text-[12px] font-medium text-ink hover:opacity-85"
        @click="activeIndex = trail.length - 1"
      >
        Reset path
      </button>
    </div>
  </div>
</template>
