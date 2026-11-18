<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
</script>

<template>
  <Accordion
    :default-value="['routing']"
    class="max-w-lg rounded-panel border border-line bg-raised px-5"
  >
    <AccordionItem value="routing">
      <AccordionTrigger>
        Edge routing policy
        <template #icon>
          <span
            aria-hidden="true"
            class="inline-flex size-4 shrink-0 items-center justify-center font-mono text-[14px] text-ink-muted transition-transform duration-[var(--p0seid0n-duration-normal)] ease-out-expo group-hover:text-ink group-data-[state=open]:rotate-45 motion-reduce:transition-none"
          >
            +
          </span>
        </template>
      </AccordionTrigger>
      <AccordionContent>
        <p>Requests route to the lowest-latency healthy edge point of presence automatically.</p>
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="tls">
      <AccordionTrigger>TLS termination</AccordionTrigger>
      <AccordionContent>
        Certificates renew ahead of expiry at each edge node with zero connection drops.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="legacy" disabled>
      <AccordionTrigger>Legacy HTTP/1.0 fallback (disabled)</AccordionTrigger>
      <AccordionContent>
        Deprecated transport profiles cannot be re-enabled for new deployments.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
