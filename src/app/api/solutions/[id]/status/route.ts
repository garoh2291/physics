import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

    // Only admins can update solution status
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, adminFeedback } = await request.json();

    if (!status || !["APPROVED", "REJECTED", "NEEDS_WORK"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if solution exists
    const existingSolution = await db.solution.findUnique({
      where: { id },
    });

    if (!existingSolution) {
      return NextResponse.json(
        { error: "Solution not found" },
        { status: 404 }
      );
    }

    // Update the solution
    const updatedSolution = await db.solution.update({
      where: { id },
      data: {
        status,
        adminFeedback: adminFeedback || null,
        updatedAt: new Date(),
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
            title: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSolution);
  } catch (error) {
    console.error("Error updating solution status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    const { id } = await params;

    const solution = await db.solution.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        exercise: {
          select: { id: true, title: true },
        },
      },
    });

    if (!solution) {
      return NextResponse.json({ error: "Լուծումը չգտնվեց" }, { status: 404 });
    }

    // Students can only view their own solutions
    if (
      session.user.role === "STUDENT" &&
      solution.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Թույլտվություն չկա" },
        { status: 403 }
      );
    }

    return NextResponse.json(solution);
  } catch (error) {
    console.error("Error fetching solution:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
