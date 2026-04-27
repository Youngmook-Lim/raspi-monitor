export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

export function rw(v: number, lo: number, hi: number, step: number): number {
  return clamp(v + (Math.random() - 0.5) * step * 2, lo, hi)
}

export function hex2rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

export function cpuCol(p: number): string {
  return p < 50 ? 'var(--green)' : p < 80 ? 'var(--yellow)' : 'var(--red)'
}

export function cpuColHex(p: number): string {
  return p < 50 ? '#a78bfa' : p < 80 ? '#f472b6' : '#ff4560'
}

export function tempCol(t: number): string {
  return t < 52 ? 'var(--green)' : t < 68 ? 'var(--yellow)' : 'var(--red)'
}

export function tempColHex(t: number): string {
  return t < 52 ? '#a78bfa' : t < 68 ? '#f472b6' : '#ff4560'
}
