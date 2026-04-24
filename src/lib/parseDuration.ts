// Extract a timed instruction from a cooking step, e.g.
//   "Simmer for 5-7 minutes on low heat."  -> { seconds: 420, matchText: "5-7 minutes" }
//   "Marinate for 10 minutes."             -> { seconds: 600, matchText: "10 minutes" }
//   "Cook for 30 seconds, stirring."       -> { seconds:  30, matchText: "30 seconds" }
//
// Ranges ("5-7 minutes", "10 to 12 min") use the upper bound — it's safer to
// let the timer run long and have the user stop early than to under-cook.
// Open-ended phrasing like "until tender" or "a few minutes" is intentionally
// ignored; those steps just won't show a timer.

const DURATION_RE =
  /\b(?:(\d+)\s*(?:-|–|to)\s*)?(\d+)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i

export interface ParsedDuration {
  seconds: number
  matchText: string
}

export function parseDuration(text: string): ParsedDuration | null {
  const m = DURATION_RE.exec(text)
  if (!m) return null
  const upper = parseInt(m[2], 10)
  if (!Number.isFinite(upper) || upper <= 0) return null

  const unit = m[3].toLowerCase()
  const multiplier = unit.startsWith('h') ? 3600 : unit.startsWith('s') ? 1 : 60

  return { seconds: upper * multiplier, matchText: m[0] }
}

export function formatTimerDisplay(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}
