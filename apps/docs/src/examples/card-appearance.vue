<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <Card>
      <CardHeader>
        <template #title>Raised</template>
        <template #description>
          <p class="text-[13px] text-ink-muted">For cards on the page background.</p>
        </template>
        <template #action><Badge variant="accent">new</Badge></template>
      </CardHeader>
      <CardContent>Content sits here.</CardContent>
      <CardFooter>
        <span>Updated just now</span>
        <Button size="sm" variant="ghost">Open</Button>
      </CardFooter>
    </Card>
    <Card appearance="surface">
      <CardHeader>
        <template #title>Surface</template>
        <template #description>
          <p class="text-[13px] text-ink-muted">For panels nested in a raised container.</p>
        </template>
      </CardHeader>
      <CardContent>Content sits here.</CardContent>
    </Card>
  </div>
</template>
