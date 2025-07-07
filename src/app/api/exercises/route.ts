/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Անհրաժեշտ է նույնականացում" },
        { status: 401 }
      );
    }

    // Get exercises with solutions for the current user (if student) or all solutions (if admin)
    const exercises = await db.exercise.findMany({
      include: {
        solutions:
          session.user.role === "STUDENT"
            ? {
                where: { userId: session.user.id },
                orderBy: { createdAt: "asc" },
              }
            : {
                include: {
                  user: {
                    select: { id: true, name: true, email: true },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(exercises);
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

    // Only admins and superadmins can create exercises
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Թույլտվություն չկա" },
        { status: 403 }
      );
    }

    const { title, problemText, problemImage } = await request.json();

    if (!title || (!problemText && !problemImage)) {
      return NextResponse.json(
        { error: "Վերնագիրը և գոնե խնդիր կամ նկար պարտադիր են" },
        { status: 400 }
      );
    }

    const exercise = await db.exercise.create({
      data: {
        title,
        problemText: problemText || null,
        problemImage: problemImage || null,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
