"use client";

import { useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "@/hooks/use-api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async () => {
          const session = await getSession();
          if (session?.user?.role === "STUDENT") {
            router.push("/dashboard");
          } else if (session?.user?.role === "ADMIN") {
            router.push("/admin");
          } else if (session?.user?.role === "SUPERADMIN") {
            router.push("/admin");
          }
        },
        onError: (error: Error) => {
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-xl md:text-2xl">
            Ֆիզիկայի վարժություններ
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm md:text-base">
                Էլ. փոստ
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm md:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm md:text-base">
                Գաղտնաբառ
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-sm md:text-base"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full text-sm md:text-base"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Մուտք գործում..." : "Մուտք"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
