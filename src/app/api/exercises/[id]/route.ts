import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const { id } = await params;

    const exercise = await db.exercise.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        solutions: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Վարժությունը չգտնվեց" },
        { status: 404 }
      );
    }

    // If student, only show their own solutions
    if (session.user.role === "STUDENT") {
      exercise.solutions = exercise.solutions.filter(
        (solution) => solution.userId === session.user.id
      );
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}

export async function PUT(
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

    // Only admins and superadmins can update exercises
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Թույլտվություն չկա" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { title, problemText } = await request.json();

    if (!title || !problemText) {
      return NextResponse.json(
        { error: "Վերնագիրը և խնդիրը պարտադիր են" },
        { status: 400 }
      );
    }

    const exercise = await db.exercise.update({
      where: { id },
      data: {
        title,
        problemText,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        solutions: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}

export async function DELETE(
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

    // Only admins and superadmins can delete exercises
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Թույլտվություն չկա" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if exercise exists
    const exercise = await db.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Վարժությունը չգտնվեց" },
        { status: 404 }
      );
    }

    // Delete exercise (cascade will handle solutions and exercise answers)
    await db.exercise.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Վարժությունը հաջողությամբ ջնջվել է",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
