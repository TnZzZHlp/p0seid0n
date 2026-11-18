<script setup lang="ts">
import { ref } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const openItem = ref<string>('tokens')
</script>

<template>
  <Accordion v-model="openItem" class="max-w-lg rounded-panel border border-line bg-raised px-5">
    <AccordionItem value="tokens">
      <AccordionTrigger>How are light and dark colours defined?</AccordionTrigger>
      <AccordionContent>
        Each colour token is written once with CSS light-dark(), so components adapt automatically
        without duplicating classes or maintaining dark: variants.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="source">
      <AccordionTrigger>Can I edit installed component files?</AccordionTrigger>
      <AccordionContent>
        Yes. Every item copies straight into your src/components/ui directory as Vue single-file
        components with zero runtime wrapper dependency.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="motion">
      <AccordionTrigger>Do animations respect reduced motion?</AccordionTrigger>
      <AccordionContent>
        All keyframes use motion-safe: utilities and transitions carry motion-reduce:transition-none,
        turning off movement whenever the operating system requests it.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
