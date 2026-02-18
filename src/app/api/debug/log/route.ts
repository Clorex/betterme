import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[CLIENT_DEBUG]", JSON.stringify(body, null, 2));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.log("[CLIENT_DEBUG_ERROR]", e?.message || e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}