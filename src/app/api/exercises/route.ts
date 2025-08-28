/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, safeDecrypt } from "@/lib/utils";

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
        createdBy: { select: { id: true, name: true, email: true } },
        solutions: {
          where: {
            userId: session.user.id, // Only get current user's solutions
          },
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
      orderBy: { createdAt: "desc" },
    });

    // Transform field names and decrypt answers for admins
    const transformedExercises = exercises.map((exercise) => {
      let decryptedAnswerValues: string[] = [];
      const originalAnswersCount = exercise.correctAnswerValues?.length || 0;

      if (exercise.correctAnswerValues && exercise.correctAnswerValues.length > 0) {
        // Decrypt for admins
        if (["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
          try {
            decryptedAnswerValues = exercise.correctAnswerValues.map((answer: string) => {
              try {
                return safeDecrypt(answer);
              } catch (error) {
                console.error("Error decrypting answer:", error);
                return answer;
              }
            });
          } catch (error) {
            console.error("Error processing answers:", error);
          }
        } else {
          // For students, provide placeholder array with correct length for status calculation
          decryptedAnswerValues = new Array(originalAnswersCount).fill("HIDDEN");
        }
      }

      return {
        ...exercise,
        correctAnswerValues: decryptedAnswerValues,
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

    const exercise = await db.exercise.create({
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
        createdById: session.user.id,
        tags: { connect: tagConnect },
        sources: { connect: sourceConnect },
        sections: { connect: sectionConnect },
        themes: { connect: themeConnect },
      },
      include: {
        tags: true,
        sources: true,
        themes: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
