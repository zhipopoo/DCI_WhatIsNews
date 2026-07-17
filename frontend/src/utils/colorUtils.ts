/**
 * Parse a hex color string to { r, g, b } (0-255).
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * Convert { r, g, b } (0-255) to { h: 0-360, s: 0-1, l: 0-1 }.
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s, l };
}

/**
 * Convert { h: 0-360, s: 0-1, l: 0-1 } to { r, g, b } (0-255).
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

type ShadeKey = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';

/**
 * Generate a full Tailwind-compatible color palette (50-950) from a single hex color.
 * Returns space-separated RGB strings suitable for CSS `rgb(var(...) / <alpha-value>)`.
 *
 * Algorithm: HSL modulation of lightness and saturation.
 *   - 50-500: lighter shades (increasing lightness, decreasing saturation)
 *   - 600: base color
 *   - 700-950: darker shades (decreasing lightness, increasing saturation)
 */
export function generateColorPalette(hex: string): Record<ShadeKey, string> {
  const { h, s, l } = rgbToHsl(hexToRgb(hex).r, hexToRgb(hex).g, hexToRgb(hex).b);
  const baseS = s;

  // Lightness and saturation factors per shade level
  const levels: { shade: ShadeKey; lFactor: number; sFactor: number }[] = [
    { shade: '50',  lFactor: 0.95, sFactor: 0.30 },
    { shade: '100', lFactor: 0.90, sFactor: 0.40 },
    { shade: '200', lFactor: 0.82, sFactor: 0.50 },
    { shade: '300', lFactor: 0.72, sFactor: 0.60 },
    { shade: '400', lFactor: 0.60, sFactor: 0.70 },
    { shade: '500', lFactor: 0.48, sFactor: 0.80 },
    { shade: '600', lFactor: l,     sFactor: 1.00 }, // base
    { shade: '700', lFactor: 0.38, sFactor: 0.90 },
    { shade: '800', lFactor: 0.28, sFactor: 1.00 },
    { shade: '900', lFactor: 0.20, sFactor: 1.00 },
    { shade: '950', lFactor: 0.12, sFactor: 1.00 },
  ];

  const palette: Record<string, string> = {};

  for (const { shade, lFactor, sFactor } of levels) {
    const newL = shade === '600' ? l : lFactor;
    const newS = Math.min(1, Math.max(0, baseS * sFactor));
    const rgb = hslToRgb(h, newS, newL);
    palette[shade] = `${rgb.r} ${rgb.g} ${rgb.b}`;
  }

  return palette as Record<ShadeKey, string>;
}

/**
 * Apply a color palette to CSS custom properties on the given element.
 */
export function applyColorPalette(element: HTMLElement, hex: string): void {
  const palette = generateColorPalette(hex);
  for (const [shade, rgb] of Object.entries(palette)) {
    element.style.setProperty(`--tw-clr-primary-${shade}`, rgb);
  }
  element.style.setProperty('--primary-color', hex);
}

/**
 * Update the browser favicon to match the theme color.
 * Generates a tiny SVG favicon with the primary color as a rounded square.
 */
export function updateFavicon(hex: string): void {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="6" fill="${hex}"/>
    <text x="16" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="white">DCI</text>
  </svg>`;
  const dataUrl = 'data:image/svg+xml,' + encodeURIComponent(svg);

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = dataUrl;
}
