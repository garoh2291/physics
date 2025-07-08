/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt, encrypt, safeDecrypt } from "@/lib/utils";

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
        createdBy: { select: { id: true, name: true, email: true } },
        solutions: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        tags: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Transform field names and decrypt answers for admins or students with correct solutions
    let decryptedAnswer = null;
    if (exercise.correctAnswer) {
      // Decrypt for admins
      if (["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
        try {
          decryptedAnswer = safeDecrypt(exercise.correctAnswer);
        } catch (error) {
          console.error("Error decrypting answer:", error);
        }
      }
      // Decrypt for students who have answered correctly
      else if (session.user.role === "STUDENT") {
        const userSolution = exercise.solutions.find(
          (s) => s.userId === session.user.id && s.isCorrect
        );
        if (userSolution) {
          try {
            decryptedAnswer = safeDecrypt(exercise.correctAnswer);
          } catch (error) {
            console.error("Error decrypting answer:", error);
          }
        }
      }
    }

    const transformedExercise = {
      id: exercise.id,
      title: exercise.title,
      problemText: exercise.problemText,
      problemImage: exercise.problemImage,
      givenText: exercise.givenText,
      givenImage: exercise.givenImage,
      solutionSteps: exercise.solutionSteps,
      solutionImage: exercise.solutionImage,
      correctAnswer: decryptedAnswer,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
      createdBy: exercise.createdBy,
      solutions: exercise.solutions,
      tags: exercise.tags,
    };

    return NextResponse.json(transformedExercise);
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
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      title,
      problemText,
      problemImage,
      givenText,
      givenImage,
      solutionSteps,
      solutionImage,
      correctAnswer,
      tagIds,
    } = await request.json();
    if (!title) {
      return NextResponse.json(
        { error: "Վերնագիրը պարտադիր է" },
        { status: 400 }
      );
    }

    // Validate that either problemText or problemImage is provided
    if (!problemText?.trim() && !problemImage) {
      return NextResponse.json(
        { error: "Տրված տվյալները պետք է պարունակեն տեքստ կամ նկար" },
        { status: 400 }
      );
    }

    // Validate that either solutionSteps or solutionImage is provided
    if (!solutionSteps?.trim() && !solutionImage) {
      return NextResponse.json(
        { error: "Լուծման քայլերը պետք է պարունակեն տեքստ կամ նկար" },
        { status: 400 }
      );
    }

    if (!correctAnswer) {
      return NextResponse.json(
        { error: "Ճիշտ պատասխանը պարտադիր է" },
        { status: 400 }
      );
    }

    // Handle tags: connect by IDs
    const tagConnect = [];
    if (Array.isArray(tagIds)) {
      for (const tagId of tagIds) {
        tagConnect.push({ id: tagId });
      }
    }

    const updatedExercise = await db.exercise.update({
      where: { id },
      data: {
        title,
        problemText: problemText || null,
        problemImage: problemImage || null,
        givenText: givenText || null,
        givenImage: givenImage || null,
        solutionSteps: solutionSteps || null,
        solutionImage: solutionImage || null,
        correctAnswer: encrypt(correctAnswer),
        tags: { set: tagConnect },
        updatedAt: new Date(),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        tags: true,
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
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    // Fetch current exercise
    const existingExercise = await db.exercise.findUnique({ where: { id } });
    if (!existingExercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      title?: string;
      problemText?: string | null;
      problemImage?: string | null;
      solutionSteps?: string | null;
      solutionImage?: string | null;
      correctAnswer?: string;
      tags?: { set: { id: string }[] };
      updatedAt?: Date;
    } = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.problemText !== undefined)
      updateData.problemText = body.problemText;
    if (body.problemImage !== undefined)
      updateData.problemImage = body.problemImage;
    if (body.solutionSteps !== undefined)
      updateData.solutionSteps = body.solutionSteps;
    if (body.solutionImage !== undefined)
      updateData.solutionImage = body.solutionImage;
    if (body.correctAnswer !== undefined)
      updateData.correctAnswer = encrypt(body.correctAnswer);
    if (body.tags !== undefined && Array.isArray(body.tags)) {
      const tagConnect = [];
      for (const tag of body.tags) {
        if (!tag.name) continue;
        const existing = await db.tag.findUnique({ where: { name: tag.name } });
        if (existing) {
          tagConnect.push({ id: existing.id });
        } else {
          const created = await db.tag.create({
            data: { name: tag.name, url: tag.url || null },
          });
          tagConnect.push({ id: created.id });
        }
      }
      updateData.tags = { set: tagConnect };
    }
    updateData.updatedAt = new Date();

    const updatedExercise = await db.exercise.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        tags: true,
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
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const exercise = await db.exercise.findUnique({ where: { id } });
    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    await db.exercise.delete({ where: { id } });
    return NextResponse.json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
