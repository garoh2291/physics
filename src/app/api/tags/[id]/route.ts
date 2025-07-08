import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Անհրաժեշտ է նույնականացում" },
        { status: 401 }
      );
    }
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Թույլտվություն չկա" },
        { status: 403 }
      );
    }

    const { id: tagId } = await params;

    // Check if tag exists and is used by exercises
    const tag = await db.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { exercises: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "Պիտակը չգտնվեց" }, { status: 404 });
    }

    if (tag._count.exercises > 0) {
      return NextResponse.json(
        { error: "Չի կարող ջնջվել՝ օգտագործվում է վարժություններում" },
        { status: 400 }
      );
    }

    await db.tag.delete({ where: { id: tagId } });
    return NextResponse.json({ message: "Պիտակը հաջողությամբ ջնջվեց" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
