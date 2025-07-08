import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { name, url } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Անվանումը պարտադիր է" },
        { status: 400 }
      );
    }
    const updated = await db.course.update({
      where: { id: params.id },
      data: { name: name.trim(), url: url || null },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Կուրսի թարմացման սխալ" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    await db.course.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Կուրսի ջնջման սխալ" }, { status: 500 });
  }
}
