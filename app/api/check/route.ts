import { NextResponse } from "next/server";
import { assignToken } from "@/lib/data-access";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cupId = searchParams.get("cupId")?.trim() || "";
  const hash = searchParams.get("hash")?.trim() || "";
  if (!cupId || !hash) {
    return NextResponse.json(
      { error: "cupId and hash are required" },
      { status: 400 }
    );
  }

  const rec = await assignToken(hash, cupId);

  if (!rec) {
    return NextResponse.json(
      { success: false, error: "token not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    token: {
      cupId: rec.cupId,
      hash: rec.hash,
      expiresAt: rec.expiresAt,
      createdAt: rec.createdAt,
    },
  });
}
