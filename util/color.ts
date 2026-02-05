/**
 * Maps a sentiment score (-10 to 10) to a color on the red → yellow → green spectrum.
 *
 * -10  = #ff0000 (red)
 *   0  = #ffff00 (yellow)
 * +10  = #00ff00 (green)
 */
export function scoreToColor(score: number): string {
  // Clamp to [-10, 10]
  const s = Math.max(-10, Math.min(10, score));

  // Normalize to [0, 1]
  const t = (s + 10) / 20;

  let r: number, g: number;

  if (t <= 0.5) {
    // Red (1,0,0) → Yellow (1,1,0)
    r = 255;
    g = Math.round(t * 2 * 255);
  } else {
    // Yellow (1,1,0) → Green (0,1,0)
    r = Math.round((1 - (t - 0.5) * 2) * 255);
    g = 255;
  }

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}00`;
}
