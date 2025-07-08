import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const HINT_COSTS = { 1: 1, 2: 3, 3: 5 };

type HintLevel = 1 | 2 | 3;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Անհրաժեշտ է նույնականացում" },
      { status: 401 }
    );
  }
  try {
    const { exerciseId, hintLevel } = await req.json();
    if (!exerciseId || ![1, 2, 3].includes(hintLevel)) {
      return NextResponse.json({ error: "Անվավեր հարցում" }, { status: 400 });
    }
    const typedHintLevel = hintLevel as HintLevel;
    // Check if already unlocked
    const existing = await db.hintUsage.findUnique({
      where: {
        userId_exerciseId_hintLevel: {
          userId: session.user.id,
          exerciseId,
          hintLevel: typedHintLevel,
        },
      },
    });
    if (existing) {
      // Already unlocked, return current state
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });
      const unlocked = await db.hintUsage.findMany({
        where: { userId: session.user.id, exerciseId },
        select: { hintLevel: true },
      });
      return NextResponse.json({
        credits: user?.credits ?? 0,
        unlockedHints: unlocked.map((h) => h.hintLevel),
      });
    }
    // Check credits
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });
    const cost = HINT_COSTS[typedHintLevel];
    if (!user || user.credits < cost) {
      return NextResponse.json(
        { error: "Բավարար կրեդիտներ չկան" },
        { status: 400 }
      );
    }
    // Deduct credits and save usage atomically
    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: cost } },
      }),
      db.hintUsage.create({
        data: {
          userId: session.user.id,
          exerciseId,
          hintLevel: typedHintLevel,
        },
      }),
    ]);
    // Return updated state
    const updatedUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });
    const unlocked = await db.hintUsage.findMany({
      where: { userId: session.user.id, exerciseId },
      select: { hintLevel: true },
    });
    return NextResponse.json({
      credits: updatedUser?.credits ?? 0,
      unlockedHints: unlocked.map((h) => h.hintLevel),
    });
  } catch {
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
