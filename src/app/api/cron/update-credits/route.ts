import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // Check if this is a cron job request (you can add authentication here if needed)
    // const authHeader = request.headers.get("authorization");

    // For security, you might want to check for a specific token
    // const expectedToken = process.env.CRON_SECRET_TOKEN;
    // if (authHeader !== `Bearer ${expectedToken}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get all users with role "STUDENT" who have less than 20 credits
    const studentsToUpdate = await db.user.findMany({
      where: {
        role: "STUDENT",
        credits: {
          lt: 20, // less than 20
        },
      },
      select: {
        id: true,
        credits: true,
        name: true,
        email: true,
      },
    });

    if (studentsToUpdate.length === 0) {
      return NextResponse.json({
        message: "No students found who need credit updates",
        updatedCount: 0,
      });
    }

    // Update credits for each student (add 1 credit, but cap at 20)
    const updatePromises = studentsToUpdate.map((student) => {
      const newCredits = Math.min(student.credits + 1, 20);
      return db.user.update({
        where: { id: student.id },
        data: { credits: newCredits },
      });
    });

    await Promise.all(updatePromises);

    console.log(`Updated credits for ${studentsToUpdate.length} students`);

    return NextResponse.json({
      message: `Successfully updated credits for ${studentsToUpdate.length} students`,
      updatedCount: studentsToUpdate.length,
      updatedStudents: studentsToUpdate.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        previousCredits: student.credits,
        newCredits: Math.min(student.credits + 1, 20),
      })),
    });
  } catch (error) {
    console.error("Error updating student credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow GET method for testing purposes
export async function GET() {
  return NextResponse.json({
    message: "Credit update cron job endpoint",
    description: "Use POST method to trigger credit updates for students",
  });
}
