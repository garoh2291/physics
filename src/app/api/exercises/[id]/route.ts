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
          // For admins, get all solutions; for students, only get their own
          ...(["ADMIN", "SUPERADMIN"].includes(session.user.role) 
            ? {} 
            : { where: { userId: session.user.id } }
          ),
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        tags: true,
        sources: true,
        sections: true,
        themes: {
          include: {
            section: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Transform field names and decrypt answer values for admins or students with correct solutions
    let decryptedAnswerValues: string[] = [];
    if (exercise.correctAnswerValues && exercise.correctAnswerValues.length > 0) {
      // Decrypt for admins
      if (["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
        try {
          decryptedAnswerValues = exercise.correctAnswerValues.map((answer: string) =>
            safeDecrypt(answer)
          );
        } catch (error) {
          console.error("Error decrypting answers:", error);
        }
      }
      // For students, show placeholders so they know how many answers there are
      // Only decrypt if they have solved it completely
      else if (session.user.role === "STUDENT") {
        const userSolution = exercise.solutions.find(
          (s) => s.userId === session.user.id && s.isCorrect
        );
        if (userSolution) {
          try {
            decryptedAnswerValues = exercise.correctAnswerValues.map((answer: string) =>
              safeDecrypt(answer)
            );
          } catch (error) {
            console.error("Error decrypting answers:", error);
          }
        } else {
          // For unsolved exercises, show placeholders to indicate number of answers
          decryptedAnswerValues = exercise.correctAnswerValues.map(
            (_, index) => `Պատասխան ${index + 1}`
          );
        }
      }
    }

    const transformedExercise = {
      ...exercise,
      correctAnswerValues: decryptedAnswerValues,
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
      exerciseNumber,
      level,
      class: classGrade,
      problemText,
      problemImage,
      givenText,
      givenImage,
      solutionSteps,
      solutionImage,
      correctAnswerValues,
      answerUnits,
      tagIds,
      sourceIds,
      sectionIds,
      themeIds,
      hintText1,
      hintImage1,
      hintText2,
      hintImage2,
      hintText3,
      hintImage3,
    } = await request.json();

    if (!exerciseNumber?.trim()) {
      return NextResponse.json(
        { error: "Վարժության համարը պարտադիր է" },
        { status: 400 }
      );
    }

    // Validate that either problemText or problemImage is provided
    if (!problemText?.trim() && !problemImage) {
      return NextResponse.json(
        { error: "Խնդիրը պետք է պարունակի տեքստ կամ նկար" },
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

    if (!correctAnswerValues || correctAnswerValues.length === 0) {
      return NextResponse.json(
        { error: "Առնվազն մեկ ճիշտ պատասխան պարտադիր է" },
        { status: 400 }
      );
    }

    if (level < 1 || level > 5) {
      return NextResponse.json(
        { error: "Մակարդակը պետք է լինի 1-5 միջակայքում" },
        { status: 400 }
      );
    }

    if (classGrade && (classGrade < 7 || classGrade > 12)) {
      return NextResponse.json(
        { error: "Դասարանը պետք է լինի 7-12 միջակայքում" },
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

    // Handle sources: connect by IDs
    const sourceConnect = [];
    if (Array.isArray(sourceIds)) {
      for (const sourceId of sourceIds) {
        sourceConnect.push({ id: sourceId });
      }
    }

    // Handle sections: connect by IDs
    const sectionConnect = [];
    if (Array.isArray(sectionIds)) {
      for (const sectionId of sectionIds) {
        sectionConnect.push({ id: sectionId });
      }
    }

    // Handle themes: connect by IDs
    const themeConnect = [];
    if (Array.isArray(themeIds)) {
      for (const themeId of themeIds) {
        themeConnect.push({ id: themeId });
      }
    }

    // Encrypt correct answer values
    const encryptedAnswerValues = correctAnswerValues.map((answer: string) =>
      encrypt(answer)
    );

    const updatedExercise = await db.exercise.update({
      where: { id },
      data: {
        exerciseNumber: exerciseNumber || null,
        level,
        class: classGrade || null,
        problemText: problemText || null,
        problemImage: problemImage || null,
        givenText: givenText || null,
        givenImage: givenImage || null,
        solutionSteps: solutionSteps || null,
        solutionImage: solutionImage || null,
        correctAnswerValues: encryptedAnswerValues,
        answerUnits: answerUnits || [],
        hintText1: hintText1 || null,
        hintImage1: hintImage1 || null,
        hintText2: hintText2 || null,
        hintImage2: hintImage2 || null,
        hintText3: hintText3 || null,
        hintImage3: hintImage3 || null,
        tags: { set: tagConnect },
        sources: { set: sourceConnect },
        sections: { set: sectionConnect },
        themes: { set: themeConnect },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        tags: true,
        sources: true,
        themes: true,
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
