/** Детерминированный псевдослучайный генератор для стабильных заглушек товаров. */
function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export interface Placeholder {
  from: string
  to: string
  initials: string
}

export function productPlaceholder(id: number, title: string): Placeholder {
  const hue = hashString(`${id}:${title}`) % 360
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

  return {
    from: `hsl(${hue} 62% 92%)`,
    to: `hsl(${(hue + 42) % 360} 58% 78%)`,
    initials: initials || '?',
  }
}
