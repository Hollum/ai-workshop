import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    await prisma.document.deleteMany();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
