import { createHash, randomBytes } from "node:crypto"

export type ExpiryOption = "one-day" | "one-month" | "one-year" | "infinite"

export function parseExpiry(option: ExpiryOption): Date | null {
  if (option === "infinite") return null
  const now = new Date()
  const d = new Date(now)
  switch (option) {
    case "one-day": {
      d.setDate(d.getDate() + 1)
      return d
    }
    case "one-month": {
      // Add one month, auto handles month rollover
      d.setMonth(d.getMonth() + 1)
      return d
    }
    case "one-year": {
      d.setFullYear(d.getFullYear() + 1)
      return d
    }
    default:
      return null
  }
}

export function generateHash(input: string): string {
  const salt = randomBytes(16).toString("hex")
  const ts = Date.now().toString(36)
  return createHash("sha256").update(`${input}:${salt}:${ts}`).digest("hex")
}
