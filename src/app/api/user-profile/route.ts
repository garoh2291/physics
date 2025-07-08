import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Անհրաժեշտ է նույնականացում" },
      { status: 401 }
    );
  }
  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        solutions: { select: { exerciseId: true, isCorrect: true } },
        hintUsages: {
          select: {
            exerciseId: true,
            hintLevel: true,
            usedAt: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
