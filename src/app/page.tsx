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
      // Redirect based on role and onboarding status
      if (session.user.role === "STUDENT") {
        if (!session.user.isOnboarded) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else if (session.user.role === "ADMIN") {
        router.push("/admin");
      } else if (session.user.role === "SUPERADMIN") {
        router.push("/admin");
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
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            Ֆիզիկայի վարժություններ
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Սովորեք ֆիզիկա ինտերակտիվ վարժությունների միջոցով: Ստեղծեք, լուծեք և
            հետևեք ձեր առաջընթացին:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Ուսանողների համար
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm md:text-base">
                Լուծեք վարժություններ, ստացեք ակնթարթային արձագանք և հետևեք ձեր
                առաջընթացին:
              </p>
              <ul className="list-disc list-inside text-xs md:text-sm text-gray-500 space-y-1">
                <li>Ինտերակտիվ վարժություններ</li>
                <li>Ակնթարթային արձագանք</li>
                <li>Հուշումներ և լուծումներ</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Ուսուցիչների համար
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm md:text-base">
                Ստեղծեք վարժություններ, գնահատեք ուսանողների աշխատանքները և
                տրամադրեք արձագանք։
              </p>
              <ul className="list-disc list-inside text-xs md:text-sm text-gray-500 space-y-1">
                <li>Վարժությունների ստեղծում</li>
                <li>Ուսանողների կառավարում</li>
                <li>Գնահատման համակարգ</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-3 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center items-center">
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link href="/login">Մուտք գործել</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full md:w-auto"
          >
            <Link href="/register">Գրանցվել</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
