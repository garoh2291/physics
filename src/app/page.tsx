"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      // Redirect based on role
      if (session.user.role === "STUDENT") {
        router.push("/dashboard");
      } else if (session.user.role === "ADMIN") {
        router.push("/admin");
      } else if (session.user.role === "SUPERADMIN") {
        router.push("/superadmin");
      }
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Բեռնվում...</div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ֆիզիկայի վարժություններ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ուսումնական հարթակ ֆիզիկայի խնդիրների լուծման համար։ Մուտք գործեք
            կամ գրանցվեք շարունակելու համար։
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Ուսանողների համար</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Լուծեք ֆիզիկայի վարժություններ, ստացեք արձագանք ուսուցիչներից և
                բարելավեք ձեր գիտելիքները։
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                <li>Մաթեմատիկական խմբագրիչ</li>
                <li>Քայլ առ քայլ լուծում</li>
                <li>Ուսուցիչների գնահատում</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ուսուցիչների համար</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Ստեղծեք վարժություններ, գնահատեք ուսանողների աշխատանքները և
                տրամադրեք արձագանք։
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                <li>Վարժությունների ստեղծում</li>
                <li>Ուսանողների կառավարում</li>
                <li>Գնահատման համակարգ</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-x-4">
          <Button asChild size="lg">
            <Link href="/login">Մուտք գործել</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Գրանցվել</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
