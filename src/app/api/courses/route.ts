import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const courses = await db.course.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { name, url } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Անվանումը պարտադիր է" },
        { status: 400 }
      );
    }
    const course = await db.course.create({
      data: { name: name.trim(), url: url || null },
    });
    return NextResponse.json(course);
  } catch {
    return NextResponse.json(
      { error: "Կուրսի ստեղծման սխալ" },
      { status: 500 }
    );
  }
}
