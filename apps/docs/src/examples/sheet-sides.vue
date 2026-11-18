<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { SheetSide } from '@/components/ui/sheet'

const sides: readonly SheetSide[] = ['right', 'left', 'top', 'bottom']
const label = ref('Frankfurt probe')
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Sheet v-for="side in sides" :key="side">
      <SheetTrigger as-child>
        <Button variant="secondary" size="sm">{{ side }}</Button>
      </SheetTrigger>
      <SheetContent :side="side">
        <SheetHeader>
          <SheetTitle>Edit probe ({{ side }})</SheetTitle>
          <SheetDescription>Update the display name for this regional endpoint.</SheetDescription>
        </SheetHeader>
        <div class="grid gap-1.5 py-2">
          <Label :for="`sheet-name-${side}`">Display name</Label>
          <Input :id="`sheet-name-${side}`" v-model="label" />
        </div>
        <SheetFooter>
          <SheetClose as-child>
            <Button variant="ghost" size="sm">Cancel</Button>
          </SheetClose>
          <SheetClose as-child>
            <Button size="sm">Save</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>
