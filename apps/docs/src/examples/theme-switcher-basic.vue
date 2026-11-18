<script setup lang="ts">
import { useTheme } from '@/components/ui/theme-provider'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'

const { theme, resolvedTheme } = useTheme()
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <ThemeSwitcher />
    <span class="text-[13px] text-ink-muted">
      choice: <code>{{ theme }}</code>, painted: <code>{{ resolvedTheme }}</code>
    </span>
  </div>
</template>
