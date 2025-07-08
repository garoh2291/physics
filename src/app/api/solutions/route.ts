import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeDecrypt } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only students can submit solutions
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { exerciseId, finalAnswer } = await request.json();

    if (!exerciseId) {
      return NextResponse.json(
        { error: "Exercise ID is required" },
        { status: 400 }
      );
    }
    if (!finalAnswer || !finalAnswer.trim()) {
      return NextResponse.json(
        { error: "Պատասխանը պարտադիր է" },
        { status: 400 }
      );
    }

    // Check if exercise exists
    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Check if answer is correct (if exercise has an answer and student provided an answer)
    let isCorrect = false;
    if (exercise.correctAnswer && finalAnswer?.trim()) {
      try {
        const correctAnswer = safeDecrypt(exercise.correctAnswer);
        // Normalize answers for comparison (remove spaces, convert to lowercase)
        const normalizedStudentAnswer = finalAnswer.trim().toLowerCase();
        const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();
        isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
      } catch (error) {
        console.error("Error checking answer:", error);
        isCorrect = false;
      }
    }

    // Check if solution already exists
    const existingSolution = await db.solution.findUnique({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId,
        },
      },
    });

    let solution;
    if (existingSolution) {
      // Update existing solution
      solution = await db.solution.update({
        where: { id: existingSolution.id },
        data: {
          finalAnswer: finalAnswer.trim(),
          isCorrect,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          exercise: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    } else {
      // Create new solution
      solution = await db.solution.create({
        data: {
          exerciseId,
          userId: session.user.id,
          finalAnswer: finalAnswer.trim(),
          isCorrect,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          exercise: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    }

    return NextResponse.json(solution);
  } catch (error) {
    console.error("Error submitting solution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can view all solutions
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const solutions = await db.solution.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exercise: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(solutions);
  } catch (error) {
    console.error("Error fetching solutions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
