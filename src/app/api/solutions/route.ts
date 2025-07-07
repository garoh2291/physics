import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Անհրաժեշտ է նույնականացում" },
        { status: 401 }
      );
    }

    // Only admins and superadmins can view all solutions
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Թույլտվություն չկա" },
        { status: 403 }
      );
    }

    const solutions = await db.solution.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        exercise: {
          select: { id: true, title: true },
        },
      },
      orderBy: [
        { status: "asc" }, // PENDING first
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(solutions);
  } catch (error) {
    console.error("Error fetching solutions:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Անհրաժեշտ է նույնականացում" },
        { status: 401 }
      );
    }

    const { exerciseId, givenData, solutionSteps, finalAnswer } =
      await request.json();

    if (!exerciseId) {
      return NextResponse.json(
        { error: "Վարժության ID-ն պարտադիր է" },
        { status: 400 }
      );
    }

    // Check if exercise exists
    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Վարժությունը չգտնվեց" },
        { status: 404 }
      );
    }

    // Get the next attempt number for this user and exercise
    const lastSolution = await db.solution.findFirst({
      where: {
        userId: session.user.id,
        exerciseId,
      },
      orderBy: { attemptNumber: "desc" },
    });

    const attemptNumber = lastSolution ? lastSolution.attemptNumber + 1 : 1;

    // Create new solution
    const solution = await db.solution.create({
      data: {
        userId: session.user.id,
        exerciseId,
        givenData: givenData || null,
        solutionSteps: solutionSteps || null,
        finalAnswer: finalAnswer || null,
        attemptNumber,
        // isCorrect will be determined by admin review or automatic checking
        isCorrect: false,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        exercise: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(solution, { status: 201 });
  } catch (error) {
    console.error("Error creating solution:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
