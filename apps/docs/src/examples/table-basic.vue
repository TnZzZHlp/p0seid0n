<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const nodes = [
  { id: 'fra-01', region: 'Frankfurt', status: 'Healthy', latency: '14.2', bandwidth: '1,240' },
  { id: 'lon-02', region: 'London', status: 'Healthy', latency: '21.8', bandwidth: '980' },
  { id: 'nrt-01', region: 'Tokyo', status: 'Degraded', latency: '148.4', bandwidth: '410' },
] as const
</script>

<template>
  <Table>
    <TableCaption>Live measurements across three regional edge nodes.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Node</TableHead>
        <TableHead>Region</TableHead>
        <TableHead>Status</TableHead>
        <TableHead numeric>Latency (ms)</TableHead>
        <TableHead numeric>Throughput (Mbit/s)</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="node in nodes" :key="node.id">
        <TableCell class="font-mono text-[13px]">{{ node.id }}</TableCell>
        <TableCell>{{ node.region }}</TableCell>
        <TableCell>
          <Badge :variant="node.status === 'Healthy' ? 'accent' : 'accent-alt'">
            {{ node.status }}
          </Badge>
        </TableCell>
        <TableCell numeric>{{ node.latency }}</TableCell>
        <TableCell numeric>{{ node.bandwidth }}</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colspan="3">Mean</TableCell>
        <TableCell numeric>61.5</TableCell>
        <TableCell numeric>877</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
</template>
