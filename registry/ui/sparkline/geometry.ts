/**
 * Bar geometry, ported from the reference PingStrip: each bar fills 0.6 of its
 * slot and the rest is the gap to its neighbours.
 */
const BAR = 0.6
/** A value this many times the median already reaches the top, so spikes cannot flatten the rest. */
const SPIKE = 3
/** Below this many samples the median is not meaningful, so the max is used instead. */
const MIN_SAMPLES_FOR_MEDIAN = 3

export function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * Upper bound for the value axis. The reference clamps to `median * 3` so a few
 * spikes do not squash the rest; with one or two samples the median is too noisy,
 * so it falls back to the max (005 risk table).
 */
export function scaleTop(values: readonly number[]): number {
  if (values.length === 0) return 1
  const max = Math.max(...values)
  if (values.length < MIN_SAMPLES_FOR_MEDIAN) return Math.max(1, max)
  return Math.max(1, Math.min(max, median(values) * SPIKE))
}

export type SparklineOptions = {
  values: readonly number[]
  /** Values are laid out across this many slots; the newest sits at the right edge. */
  slots?: number
  /** Upper bound of the value axis; defaults to the derived scale. */
  max?: number
}

/**
 * Builds the bar path in a `0 0 slots 1` viewBox where y grows downward, so every
 * bar is drawn from y=1 up to `1 - value / top`. Returns an empty string when there
 * is nothing to draw.
 */
export function sparklinePath({ values, slots, max }: SparklineOptions): string {
  if (values.length === 0) return ''

  // The slot count never drops below the sample count, or bars would overlap.
  const width = Math.max(slots ?? values.length, values.length)
  const top = max !== undefined ? Math.max(1e-9, max) : scaleTop(values)
  const first = width - values.length
  const halfGap = (1 - BAR) / 2

  let d = ''
  for (let index = 0; index < values.length; index += 1) {
    const ratio = Math.min(1, Math.max(0, values[index] / top))
    const x = first + index + halfGap
    d += `M${round(x)},1V${round(1 - ratio)}h${BAR}V1Z`
  }
  return d
}

/** Trims float noise so the generated `d` stays comparable between runs. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000
}
