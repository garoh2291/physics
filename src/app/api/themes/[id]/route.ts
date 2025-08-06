import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { name, url, sectionId } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Անվանումը պարտադիր է" },
        { status: 400 }
      );
    }
    if (!sectionId) {
      return NextResponse.json({ error: "Բաժինը պարտադիր է" }, { status: 400 });
    }
    const { id } = await params;
    const updated = await db.theme.update({
      where: { id },
      data: {
        name: name.trim(),
        url: url || null,
        sectionId,
      },
      include: {
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Թեմայի թարմացման սխալ" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await params;
    await db.theme.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Թեմայի ջնջման սխալ" }, { status: 500 });
  }
}
