let ctx: AudioContext | null = null

/** Two-tone "ding" synthesized with the Web Audio API — no audio asset to ship or license. */
export function playNewOrderChime() {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === "suspended") void ctx.resume()

    const now = ctx.currentTime
    ;[880, 1320].forEach((freq, i) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = "sine"
      osc.frequency.value = freq
      const start = now + i * 0.12
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3)
      osc.connect(gain)
      gain.connect(ctx!.destination)
      osc.start(start)
      osc.stop(start + 0.32)
    })
  } catch {
    // Web Audio unavailable (e.g. very old browser) — silently skip the chime.
  }
}
