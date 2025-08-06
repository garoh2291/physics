"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { StudiedPlace } from "@prisma/client";

interface OnboardingData {
  city: string;
  country: string;
  age: number;
  studiedPlace: StudiedPlace;
  class?: number;
  course?: number;
  schoolName: string;
  preferredLevel: number;
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    city: "",
    country: "",
    age: 0,
    studiedPlace: StudiedPlace.SCHOOL,
    class: undefined,
    course: undefined,
    schoolName: "",
    preferredLevel: 1,
  });

  // Redirect if not authenticated or already onboarded
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Բեռնվում...</div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (session.user.isOnboarded) {
    router.push("/dashboard");
    return null;
  }

  const handleInputChange = (
    field: keyof OnboardingData,
    value: string | number | StudiedPlace
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.city && formData.country && formData.age > 0);
      case 2:
        return !!(formData.studiedPlace && formData.schoolName);
      case 3:
        if (formData.studiedPlace === StudiedPlace.SCHOOL) {
          return !!(
            formData.class &&
            formData.class >= 7 &&
            formData.class <= 12
          );
        } else if (formData.studiedPlace === StudiedPlace.UNIVERSITY) {
          return !!(
            formData.course &&
            formData.course >= 1 &&
            formData.course <= 4
          );
        }
        return true;
      case 4:
        return !!(formData.preferredLevel >= 1 && formData.preferredLevel <= 5);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError("");
    } else {
      setError("Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը");
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      setError("Խնդրում ենք լրացնել բոլոր պարտադիր դաշտերը");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/user-profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Սխալ տեղի ունեցավ");
      }

      const result = await response.json();
      console.log("Onboarding successful:", result);
      console.log("User data:", result.user);

      // Force a session refresh by calling the session API
      await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      });

      // Use window.location to force a full page reload and session refresh
      // Add a query parameter to bypass middleware temporarily
      window.location.href = "/dashboard?onboarded=true";
    } catch (error) {
      setError(error instanceof Error ? error.message : "Սխալ տեղի ունեցավ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="city">Քաղաք *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Օրինակ՝ Երևան"
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Երկիր *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Օրինակ՝ Հայաստան"
                required
              />
            </div>
            <div>
              <Label htmlFor="age">Տարիք *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                value={formData.age || ""}
                onChange={(e) =>
                  handleInputChange("age", parseInt(e.target.value) || 0)
                }
                placeholder="Օրինակ՝ 16"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="studiedPlace">Որտեղ եք սովորում *</Label>
              <Select
                value={formData.studiedPlace}
                onValueChange={(value) =>
                  handleInputChange("studiedPlace", value as StudiedPlace)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ընտրեք ձեր ուսումնական հաստատությունը" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StudiedPlace.SCHOOL}>Դպրոց</SelectItem>
                  <SelectItem value={StudiedPlace.UNIVERSITY}>
                    Համալսարան
                  </SelectItem>
                  <SelectItem value={StudiedPlace.NOT_STUDYING}>
                    Չեմ սովորում
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="schoolName">
                {formData.studiedPlace === StudiedPlace.SCHOOL
                  ? "Դպրոցի անվանում"
                  : formData.studiedPlace === StudiedPlace.UNIVERSITY
                  ? "Համալսարանի անվանում"
                  : "Կրթական հաստատության անվանում"}{" "}
                *
              </Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) =>
                  handleInputChange("schoolName", e.target.value)
                }
                placeholder="Օրինակ՝ Երևանի պետական համալսարան"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {formData.studiedPlace === StudiedPlace.SCHOOL && (
              <div>
                <Label htmlFor="class">Դասարան *</Label>
                <Select
                  value={formData.class?.toString() || ""}
                  onValueChange={(value) =>
                    handleInputChange("class", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ընտրեք դասարանը" />
                  </SelectTrigger>
                  <SelectContent>
                    {[7, 8, 9, 10, 11, 12].map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        {grade}-րդ դասարան
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {formData.studiedPlace === StudiedPlace.UNIVERSITY && (
              <div>
                <Label htmlFor="course">Կուրս *</Label>
                <Select
                  value={formData.course?.toString() || ""}
                  onValueChange={(value) =>
                    handleInputChange("course", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ընտրեք կուրսը" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((course) => (
                      <SelectItem key={course} value={course.toString()}>
                        {course}-րդ կուրս
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="preferredLevel">
                Նախընտրելի վարժությունների մակարդակ *
              </Label>
              <Select
                value={formData.preferredLevel.toString()}
                onValueChange={(value) =>
                  handleInputChange("preferredLevel", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ընտրեք մակարդակը" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Հեշտ</SelectItem>
                  <SelectItem value="2">2 - Միջին</SelectItem>
                  <SelectItem value="3">3 - Բարդ</SelectItem>
                  <SelectItem value="4">4 - Շատ բարդ</SelectItem>
                  <SelectItem value="5">5 - Էքսպերտ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Հուշում:</strong> Դուք կարող եք փոխել այս կարգավորումը
                ավելի ուշ ձեր պրոֆիլում:
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Անձնական տվյալներ";
      case 2:
        return "Կրթական տվյալներ";
      case 3:
        return formData.studiedPlace === StudiedPlace.SCHOOL
          ? "Դասարան"
          : "Կուրս";
      case 4:
        return "Նախընտրություններ";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Բարի գալուստ! 👋</CardTitle>
          <p className="text-sm text-gray-600">
            Քայլ {step}/4: {getStepTitle()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderStep()}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Հետ
            </Button>

            {step < 4 ? (
              <Button onClick={handleNext}>Հաջորդ</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Պահպանվում..." : "Ավարտել"}
              </Button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`h-2 flex-1 rounded ${
                  stepNumber <= step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
