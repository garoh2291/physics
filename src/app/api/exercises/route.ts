/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt, encrypt, safeDecrypt } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Անհրաժեշտ է նույնականացում" },
        { status: 401 }
      );
    }

    const exercises = await db.exercise.findMany({
      include: {
        tags: true,
        solutions: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform field names and decrypt answers for admins
    const transformedExercises = exercises.map((exercise) => {
      let decryptedAnswer = null;
      if (
        exercise.correctAnswer &&
        ["ADMIN", "SUPERADMIN"].includes(session.user.role)
      ) {
        try {
          decryptedAnswer = safeDecrypt(exercise.correctAnswer);
        } catch (error) {
          console.error("Error decrypting answer:", error);
        }
      }

      return {
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
    });

    return NextResponse.json(transformedExercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
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
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Թույլտվություն չկա" },
        { status: 403 }
      );
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

    // Validate that either givenText or givenImage is provided
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

    const exercise = await db.exercise.create({
      data: {
        title,
        problemText: problemText || null,
        problemImage: problemImage || null,
        givenText: givenText || null,
        givenImage: givenImage || null,
        solutionSteps: solutionSteps || null,
        solutionImage: solutionImage || null,
        correctAnswer: encrypt(correctAnswer),
        createdById: session.user.id,
        tags: { connect: tagConnect },
      },
      include: {
        tags: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
