import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: exerciseId } = await params;

    // Get solution statistics for this exercise
    const solutionStats = await db.solution.aggregate({
      where: {
        exerciseId,
        isCorrect: true, // Only count fully correct solutions
      },
      _count: {
        id: true,
      },
    });

    const partialSolutionStats = await db.solution.aggregate({
      where: {
        exerciseId,
        isCorrect: false,
        correctAnswersCount: {
          gt: 0, // At least one correct answer
        },
      },
      _count: {
        id: true,
      },
    });

    const totalAttempts = await db.solution.count({
      where: {
        exerciseId,
      },
    });

    return NextResponse.json({
      exerciseId,
      completelyCorrect: solutionStats._count.id,
      partiallyCorrect: partialSolutionStats._count.id,
      totalAttempts,
      totalSolved: solutionStats._count.id + partialSolutionStats._count.id,
    });
  } catch (error) {
    console.error("Error fetching exercise statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
