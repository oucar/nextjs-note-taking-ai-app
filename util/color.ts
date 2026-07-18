/**
 * Maps a sentiment score (-10 to 10) to a warm diverging scale:
 *
 *   -10 brick  →  0 warm gray  →  +10 moss
 *
 * Each arm steps monotonically in lightness toward the neutral midpoint,
 * so polarity (which side of zero) and magnitude (how far) both read
 * correctly — and nothing screams neon.
 */
const STOPS: Array<[number, string]> = [
  [-10, '#b2492c'], // brick
  [-5, '#c98a5e'], // clay
  [0, '#a8a094'], // warm neutral
  [5, '#8fa872'], // sage
  [10, '#4d8544'], // moss
];

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const rgbToHex = ([r, g, b]: [number, number, number]) =>
  `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`;

export function scoreToColor(score: number): string {
  const s = Math.max(-10, Math.min(10, score));

  for (let i = 0; i < STOPS.length - 1; i++) {
    const [x0, c0] = STOPS[i];
    const [x1, c1] = STOPS[i + 1];
    if (s >= x0 && s <= x1) {
      const t = (s - x0) / (x1 - x0);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      return rgbToHex([
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ]);
    }
  }
  return STOPS[STOPS.length - 1][1];
}
