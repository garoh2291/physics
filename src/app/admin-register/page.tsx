"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegisterAdmin } from "@/hooks/use-api";

export default function RegisterAdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPERADMIN">("ADMIN");
  const [error, setError] = useState("");
  const router = useRouter();

  const registerAdminMutation = useRegisterAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Գաղտնաբառերը չեն համապատասխանում");
      return;
    }

    registerAdminMutation.mutate(
      { name, email, password, role },
      {
        onSuccess: () => {
          router.push("/login?message=Ադմինը հաջողությամբ ստեղծվել է");
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
          <CardTitle className="text-center text-red-600 text-xl md:text-2xl">
            Ադմին գրանցում
          </CardTitle>
          <p className="text-xs md:text-sm text-center text-gray-500">
            Գաղտնի էջ
          </p>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm md:text-base">
                Անուն
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-sm md:text-base"
              />
            </div>
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
              <Label htmlFor="role" className="text-sm md:text-base">
                Դեր
              </Label>
              <Select
                value={role}
                onValueChange={(value: "ADMIN" | "SUPERADMIN") =>
                  setRole(value)
                }
              >
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Ադմին</SelectItem>
                  <SelectItem value="SUPERADMIN">Սուպեր ադմին</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm md:text-base">
                Կրկնել գաղտնաբառը
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={registerAdminMutation.isPending}
            >
              {registerAdminMutation.isPending
                ? "Ստեղծվում..."
                : "Ստեղծել ադմին"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
