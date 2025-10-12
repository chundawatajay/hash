import { NextResponse } from "next/server"
import { createToken } from "@/lib/data-access"
import type { ExpiryOption } from "@/lib/hash"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const value = String(body?.value ?? "").trim()
    const expiry = String(body?.expiry ?? "one-day") as ExpiryOption

    if (!value) {
      return NextResponse.json({ error: "value is required" }, { status: 400 })
    }
    if (!["one-day", "one-month", "one-year", "infinite"].includes(expiry)) {
      return NextResponse.json({ error: "invalid expiry" }, { status: 400 })
    }

    const created = await createToken(value, expiry)
    return NextResponse.json({
      hash: created.hash,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
      value: created.value,
    })
  } catch (err: any) {
    return NextResponse.json({ error: "failed to generate" }, { status: 500 })
  }
}
