import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudiedPlace } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Անհրաժեշտ է նույնականացում" },
        { status: 401 }
      );
    }

    const {
      city,
      country,
      age,
      studiedPlace,
      class: classGrade,
      course,
      schoolName,
      preferredLevel,
    } = await request.json();

    // Validation
    if (
      !city ||
      !country ||
      !age ||
      !studiedPlace ||
      !schoolName ||
      !preferredLevel
    ) {
      return NextResponse.json(
        { error: "Բոլոր պարտադիր դաշտերը պետք է լրացվեն" },
        { status: 400 }
      );
    }

    if (age < 1 || age > 120) {
      return NextResponse.json(
        { error: "Տարիքը պետք է լինի 1-120 միջակայքում" },
        { status: 400 }
      );
    }

    if (preferredLevel < 1 || preferredLevel > 5) {
      return NextResponse.json(
        { error: "Նախընտրելի մակարդակը պետք է լինի 1-5 միջակայքում" },
        { status: 400 }
      );
    }

    // Validate class/course based on studied place
    if (studiedPlace === StudiedPlace.SCHOOL) {
      if (!classGrade || classGrade < 7 || classGrade > 12) {
        return NextResponse.json(
          { error: "Դասարանը պետք է լինի 7-12 միջակայքում" },
          { status: 400 }
        );
      }
    } else if (studiedPlace === StudiedPlace.UNIVERSITY) {
      if (!course || course < 1 || course > 4) {
        return NextResponse.json(
          { error: "Կուրսը պետք է լինի 1-4 միջակայքում" },
          { status: 400 }
        );
      }
    }

    // Update user with onboarding data
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        city,
        country,
        age,
        studiedPlace,
        class: studiedPlace === StudiedPlace.SCHOOL ? classGrade : null,
        course: studiedPlace === StudiedPlace.UNIVERSITY ? course : null,
        schoolName,
        preferredLevel,
        isOnboarded: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOnboarded: true,
        city: true,
        country: true,
        age: true,
        studiedPlace: true,
        class: true,
        course: true,
        schoolName: true,
        preferredLevel: true,
      },
    });

    return NextResponse.json({
      message: "Օգտատիրոջ տվյալները հաջողությամբ պահպանվել են",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Սերվերի սխալ" }, { status: 500 });
  }
}
