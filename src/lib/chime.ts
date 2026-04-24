// Play a short two-beep chime via Web Audio. Used as a timer-done alert.
// Synthesised on the fly so we don't ship an audio asset.
//
// Must be triggered by a user gesture at least once per page (timer Start tap
// qualifies) or mobile browsers will silently suppress the sound.
export function playChime() {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return

    const ctx = new Ctor()
    const beep = (startAt: number, freq: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(0.25, startAt + 0.02)
      gain.gain.linearRampToValueAtTime(0, startAt + 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(startAt)
      osc.stop(startAt + 0.32)
    }

    const now = ctx.currentTime
    beep(now, 880)
    beep(now + 0.4, 880)

    // Close the context after the tail of the second beep to free resources.
    setTimeout(() => ctx.close().catch(() => {}), 1000)
  } catch {
    // Audio blocked, suspended, or unsupported — silently continue.
  }
}
