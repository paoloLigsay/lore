import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const RELATIVE_TIME_UNITS: [string, number][] = [
  ["y", 60 * 60 * 24 * 365],
  ["mo", 60 * 60 * 24 * 30],
  ["w", 60 * 60 * 24 * 7],
  ["d", 60 * 60 * 24],
  ["h", 60 * 60],
  ["m", 60],
]

export function formatRelativeTime(date: Date | string) {
  const target = typeof date === "string" ? new Date(date) : date
  const seconds = (Date.now() - target.getTime()) / 1000

  if (seconds < 60) return "just now"

  for (const [unit, secondsInUnit] of RELATIVE_TIME_UNITS) {
    const value = Math.floor(seconds / secondsInUnit)
    if (value >= 1) return `${value}${unit} ago`
  }

  return "just now"
}
