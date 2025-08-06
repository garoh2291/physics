import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sources = await db.source.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(sources);
  } catch (error) {
    console.error("Error fetching sources:", error);
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

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Աղբյուրի անվանումը պարտադիր է" },
        { status: 400 }
      );
    }

    // Check if source already exists
    const existingSource = await db.source.findUnique({
      where: { name: name.trim() },
    });

    if (existingSource) {
      return NextResponse.json(
        { error: "Այս անվանումով աղբյուր արդեն գոյություն ունի" },
        { status: 400 }
      );
    }

    const source = await db.source.create({
      data: {
        name: name.trim(),
        url: url?.trim() || null,
      },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error("Error creating source:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
