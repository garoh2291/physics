import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

// Decrypt function for admins
function decrypt(encryptedText: string): string {
  try {
    const key = process.env.ENCRYPTION_KEY || "default-key-for-development";
    const algorithm = "aes-256-cbc";

    // Split IV and encrypted text
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    // Create a 32-byte key from the provided key
    const keyBuffer = crypto.createHash("sha256").update(key).digest();

    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "Decryption failed";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exercise = await db.exercise.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        solutions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        exerciseAnswer: true,
      },
    });

    // Decrypt the answer for admins
    if (exercise?.exerciseAnswer?.correctAnswer) {
      exercise.exerciseAnswer.correctAnswer = decrypt(
        exercise.exerciseAnswer.correctAnswer
      );
    }

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, problemText, problemImage } = body;

    if (!title || (!problemText && !problemImage)) {
      return NextResponse.json(
        {
          error: "Title and at least one of problem text or image is required",
        },
        { status: 400 }
      );
    }

    // Check if exercise exists
    const existingExercise = await db.exercise.findUnique({
      where: { id },
    });

    if (!existingExercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Update the exercise
    const updatedExercise = await db.exercise.update({
      where: { id },
      data: {
        title,
        problemText: problemText || null,
        problemImage: problemImage || null,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, problemText, problemImage } = body;

    // Fetch current exercise
    const existingExercise = await db.exercise.findUnique({ where: { id } });
    if (!existingExercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // If updating text or image, ensure at least one is present
    const newProblemText =
      problemText !== undefined ? problemText : existingExercise.problemText;
    const newProblemImage =
      problemImage !== undefined ? problemImage : existingExercise.problemImage;
    if (!newProblemText && !newProblemImage) {
      return NextResponse.json(
        { error: "At least one of problem text or image is required" },
        { status: 400 }
      );
    }

    const updatedExercise = await db.exercise.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        problemText: newProblemText,
        problemImage: newProblemImage,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error("Error patching exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if exercise exists
    const exercise = await db.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Delete the exercise (cascade will handle related records)
    await db.exercise.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
