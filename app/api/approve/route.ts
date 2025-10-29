import { NextResponse } from "next/server"
import { createToken } from "@/lib/data-access"
import type { ExpiryOption } from "@/lib/hash"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const isApproved = Boolean(body?.isApproved)
    const hash = String(body?.hash ?? "").trim()
    if (!hash) {
      return NextResponse.json({ error: "hash is required" }, { status: 400 })
    }

    const token = await db.token.findUnique({ where: { hash } })
    if (!token) {
      return NextResponse.json({ error: "token not found" }, { status: 404 })
    }

    const updated = await db.token.update({
      where: { hash },
      data: { isApproved },
    })

    if (!updated) {
      return NextResponse.json({ error: "failed to update token" }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: "failed to approve" }, { status: 500 })
  }
}
