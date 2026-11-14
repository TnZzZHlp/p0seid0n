<script setup lang="ts">
import { ref } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const value = ref('overview')
</script>

<template>
  <Tabs v-model="value" class="max-w-md">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
      <TabsTrigger value="billing">Billing</TabsTrigger>
      <TabsTrigger value="disabled" disabled>Disabled</TabsTrigger>
    </TabsList>
    <TabsContent value="overview">Arrow keys move between triggers, Home and End jump to the ends.</TabsContent>
    <TabsContent value="settings">Inactive panels stay mounted, so form state survives a tab change.</TabsContent>
    <TabsContent value="billing">Set unmount-on-hide to drop inactive panels instead.</TabsContent>
  </Tabs>
</template>
