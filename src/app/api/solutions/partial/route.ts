import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeDecrypt } from "@/lib/utils";

interface SubmittedAnswer {
  index: number;
  answer: string;
  isCorrect: boolean;
  submittedAt: string;
}

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

    const { exerciseId, answerIndex, answer } = await request.json();

    if (!exerciseId) {
      return NextResponse.json(
        { error: "Exercise ID is required" },
        { status: 400 }
      );
    }
    if (answerIndex === undefined || answerIndex < 0) {
      return NextResponse.json(
        { error: "Answer index is required" },
        { status: 400 }
      );
    }
    if (!answer || !answer.trim()) {
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

    // Check if the answer index is valid
    if (answerIndex >= exercise.correctAnswers.length) {
      return NextResponse.json(
        { error: "Invalid answer index" },
        { status: 400 }
      );
    }

    // Check if answer is correct
    let isCorrect = false;
    try {
      const correctAnswer = safeDecrypt(exercise.correctAnswers[answerIndex]);
      const normalizedStudentAnswer = answer.trim().toLowerCase();
      const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();
      isCorrect = normalizedStudentAnswer === normalizedCorrectAnswer;
    } catch (error) {
      console.error("Error checking answer:", error);
      isCorrect = false;
    }

    // Get or create solution
    const existingSolution = await db.solution.findUnique({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId,
        },
      },
    });

    let submittedAnswers: SubmittedAnswer[] = [];
    let correctAnswersCount = 0;

    if (existingSolution) {
      submittedAnswers = Array.isArray(existingSolution.submittedAnswers)
        ? (existingSolution.submittedAnswers as unknown as SubmittedAnswer[])
        : [];
      correctAnswersCount = existingSolution.correctAnswersCount;
    }

    // Update the specific answer
    const newSubmittedAnswer: SubmittedAnswer = {
      index: answerIndex,
      answer: answer.trim(),
      isCorrect,
      submittedAt: new Date().toISOString(),
    };

    // Find if this answer index was already submitted
    const existingAnswerIndex = submittedAnswers.findIndex(
      (sa: SubmittedAnswer) => sa.index === answerIndex
    );

    let wasAlreadyCorrect = false;
    if (existingAnswerIndex >= 0) {
      wasAlreadyCorrect = submittedAnswers[existingAnswerIndex].isCorrect;
      submittedAnswers[existingAnswerIndex] = newSubmittedAnswer;
    } else {
      submittedAnswers.push(newSubmittedAnswer);
    }

    // Recalculate correct answers count
    correctAnswersCount = submittedAnswers.filter(
      (sa: SubmittedAnswer) => sa.isCorrect
    ).length;

    // Check if all answers are correct
    const allCorrect = correctAnswersCount === exercise.correctAnswers.length;

    // Update or create the solution
    let solution;
    if (existingSolution) {
      solution = await db.solution.update({
        where: { id: existingSolution.id },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          submittedAnswers: submittedAnswers as any,
          correctAnswersCount,
          isCorrect: allCorrect,
          updatedAt: new Date(),
          // Keep the finalAnswer as the concatenation of all submitted answers for backward compatibility
          finalAnswer: submittedAnswers
            .map((sa: SubmittedAnswer) => `${sa.index + 1}: ${sa.answer}`)
            .join("; "),
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
              correctAnswers: true,
            },
          },
        },
      });
    } else {
      solution = await db.solution.create({
        data: {
          exerciseId,
          userId: session.user.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          submittedAnswers: submittedAnswers as any,
          correctAnswersCount,
          isCorrect: allCorrect,
          finalAnswer: submittedAnswers
            .map((sa: SubmittedAnswer) => `${sa.index + 1}: ${sa.answer}`)
            .join("; "),
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
              correctAnswers: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      ...solution,
      // Add the partial result info directly to the solution object for easier frontend access
      partialResult: {
        answerIndex,
        isCorrect,
        wasAlreadyCorrect,
        correctAnswersCount,
        totalAnswers: exercise.correctAnswers.length,
        allCorrect,
      },
    });
  } catch (error) {
    console.error("Error submitting partial solution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
