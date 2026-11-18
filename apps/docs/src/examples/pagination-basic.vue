<script setup lang="ts">
import { ref } from 'vue'
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from '@/components/ui/pagination'

const page = ref(3)
</script>

<template>
  <div class="grid gap-3">
    <Pagination v-model:page="page" :total="100" :items-per-page="10" :sibling-count="1" show-edges>
      <PaginationList v-slot="{ items }">
        <PaginationFirst />
        <PaginationPrev />
        <template v-for="(item, index) in items">
          <PaginationListItem v-if="item.type === 'page'" :key="item.value" :value="item.value" />
          <PaginationEllipsis v-else :key="`ellipsis-${index}`" />
        </template>
        <PaginationNext />
        <PaginationLast />
      </PaginationList>
    </Pagination>
    <p class="text-center text-[12px] text-ink-muted">
      Showing page <span class="font-condensed text-[14px] font-medium tabular-nums text-ink">{{ page }}</span> of 10
    </p>
  </div>
</template>
