import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

// Simple encryption for answers
function encrypt(text: string): string {
  const key = process.env.ENCRYPTION_KEY || "default-key-for-development";
  const algorithm = "aes-256-cbc";
  const iv = crypto.randomBytes(16);

  // Create a 32-byte key from the provided key
  const keyBuffer = crypto.createHash("sha256").update(key).digest();

  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Combine IV and encrypted text
  return iv.toString("hex") + ":" + encrypted;
}

export async function POST(
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

    // Only admins and superadmins can create exercise answers
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Թույլտվություն չկա" },
        { status: 403 }
      );
    }

    const { correctAnswer, givenData, solutionSteps } = await request.json();
    const { id: exerciseId } = await params;

    // Check if exercise exists
    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Վարժությունը գտնվել չի" },
        { status: 404 }
      );
    }

    // Encrypt the correct answer if provided
    const encryptedAnswer = correctAnswer ? encrypt(correctAnswer) : null;

    // Create or update exercise answer
    const exerciseAnswer = await db.exerciseAnswer.upsert({
      where: { exerciseId },
      update: {
        correctAnswer: encryptedAnswer || "",
        givenData: givenData || null,
        solutionSteps: solutionSteps || null,
      },
      create: {
        exerciseId,
        correctAnswer: encryptedAnswer || "",
        givenData: givenData || null,
        solutionSteps: solutionSteps || null,
      },
    });

    return NextResponse.json({
      message: "Պատասխանը հաջողությամբ պահպանվել է",
      exerciseAnswer: {
        id: exerciseAnswer.id,
        exerciseId: exerciseAnswer.exerciseId,
        hasCorrectAnswer: !!encryptedAnswer,
        hasGivenData: !!givenData,
        hasSolutionSteps: !!solutionSteps,
        createdAt: exerciseAnswer.createdAt,
      },
    });
  } catch (error) {
    console.error("Error saving exercise answer:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}

export async function GET(
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

    // Only admins and superadmins can view exercise answers
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Թույլտվություն չկա" },
        { status: 403 }
      );
    }

    const { id: exerciseId } = await params;

    const exerciseAnswer = await db.exerciseAnswer.findUnique({
      where: { exerciseId },
    });

    if (!exerciseAnswer) {
      return NextResponse.json(
        { error: "Պատասխանը գտնվել չի" },
        { status: 404 }
      );
    }

    // Don't return the encrypted answer in the response for security
    return NextResponse.json({
      id: exerciseAnswer.id,
      exerciseId: exerciseAnswer.exerciseId,
      givenData: exerciseAnswer.givenData,
      solutionSteps: exerciseAnswer.solutionSteps,
      hasCorrectAnswer: !!exerciseAnswer.correctAnswer,
      createdAt: exerciseAnswer.createdAt,
    });
  } catch (error) {
    console.error("Error fetching exercise answer:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
