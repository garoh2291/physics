import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const themes = await db.theme.findMany({
      include: {
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(themes);
  } catch (error) {
    console.error("Error fetching themes:", error);
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

    const { name, url, sectionId } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Թեմայի անվանումը պարտադիր է" },
        { status: 400 }
      );
    }

    if (!sectionId) {
      return NextResponse.json({ error: "Բաժինը պարտադիր է" }, { status: 400 });
    }

    // Check if theme already exists
    const existingTheme = await db.theme.findUnique({
      where: { name: name.trim() },
    });

    if (existingTheme) {
      return NextResponse.json(
        { error: "Այս անվանումով թեմա արդեն գոյություն ունի" },
        { status: 400 }
      );
    }

    const theme = await db.theme.create({
      data: {
        name: name.trim(),
        url: url?.trim() || null,
        sectionId,
      },
      include: {
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error("Error creating theme:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
