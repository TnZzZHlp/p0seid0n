<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Tooltip :delay="150">
      <TooltipTrigger as-child><Button variant="secondary">Top</Button></TooltipTrigger>
      <TooltipContent side="top">Above the trigger</TooltipContent>
    </Tooltip>
    <Tooltip :delay="150">
      <TooltipTrigger as-child><Button variant="secondary">Right</Button></TooltipTrigger>
      <TooltipContent side="right">Beside the trigger</TooltipContent>
    </Tooltip>
    <Tooltip :delay="150">
      <TooltipTrigger as-child><Button variant="secondary">Shortcut</Button></TooltipTrigger>
      <TooltipContent side="bottom" shortcut="K">Toggle panel</TooltipContent>
    </Tooltip>
  </div>
</template>
