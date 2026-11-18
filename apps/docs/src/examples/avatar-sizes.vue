<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const portrait =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="%232F6FE4"/><circle cx="32" cy="24" r="11" fill="%23FFFFFF"/><path d="M14 54c2-11 10-16 18-16s16 5 18 16" fill="%23FFFFFF"/></svg>'
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <Avatar size="sm">
      <AvatarImage :src="portrait" alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
    <Avatar size="md">
      <AvatarImage :src="portrait" alt="Grace Hopper" />
      <AvatarFallback>GH</AvatarFallback>
    </Avatar>
    <Avatar size="lg">
      <AvatarFallback>TN</AvatarFallback>
    </Avatar>
    <Avatar size="md" shape="square">
      <AvatarImage :src="portrait" alt="Node operator" />
      <AvatarFallback>NO</AvatarFallback>
    </Avatar>
    <Avatar size="lg" shape="square">
      <AvatarFallback>EU</AvatarFallback>
    </Avatar>
  </div>
</template>
