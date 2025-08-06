import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sections = await db.section.findMany({
      include: {
        themes: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
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

    const { name, url } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Անվանումը պարտադիր է" },
        { status: 400 }
      );
    }

    const existingSection = await db.section.findUnique({
      where: { name: name.trim() },
    });

    if (existingSection) {
      return NextResponse.json(
        { error: "Այս անվանումով բաժին արդեն գոյություն ունի" },
        { status: 400 }
      );
    }

    const section = await db.section.create({
      data: {
        name: name.trim(),
        url: url || null,
      },
      include: {
        themes: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
