"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";
import { useSolutions } from "@/hooks/use-api";

type Solution = {
  id: string;
  userId: string;
  exerciseId: string;
  finalAnswer?: string;
  isCorrect: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  exercise: {
    id: string;
    exerciseNumber?: string;
  };
};

export default function AdminSolutionsPage() {
  const [correctnessFilter, setCorrectnessFilter] = useState<string>("ALL");
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: solutions, isLoading, error } = useSolutions();

  console.log("Solutions data:", solutions);

  const filteredSolutions =
    solutions?.filter((solution) => {
      if (correctnessFilter === "ALL") return true;
      if (correctnessFilter === "CORRECT") return solution.isCorrect;
      if (correctnessFilter === "INCORRECT") return !solution.isCorrect;
      return true;
    }) || [];

  const getCorrectnessBadge = (isCorrect: boolean) => {
    if (isCorrect) {
      return (
        <Badge variant="outline" className="text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ճիշտ պատասխան
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-red-600">
          <XCircle className="h-3 w-3 mr-1" />
          Սխալ պատասխան
        </Badge>
      );
    }
  };

  const openSolutionDialog = (solution: Solution) => {
    setSelectedSolution(solution);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Բեռնվում...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Սխալ՝ {error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-lg md:text-xl lg:text-3xl font-bold text-gray-900">
                Ուսանողների լուծումներ
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Ընդհանուր՝ {solutions?.length || 0} լուծում • Ավտոմատ ստուգում
              </p>
            </div>
            <div className="flex items-center">
              <Select
                value={correctnessFilter}
                onValueChange={setCorrectnessFilter}
              >
                <SelectTrigger className="w-full sm:w-48 text-sm">
                  <SelectValue placeholder="Ընտրել կարգավիճակ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Բոլորը</SelectItem>
                  <SelectItem value="CORRECT">Ճիշտ պատասխաններ</SelectItem>
                  <SelectItem value="INCORRECT">Սխալ պատասխաններ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {filteredSolutions.length === 0 ? (
          <Card>
            <CardContent className="py-8 md:py-12">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-base md:text-lg">Լուծումներ չկան</p>
                <p className="text-sm">
                  Ընտրված կարգավիճակով լուծումներ չեն գտնվել
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {filteredSolutions.map((solution) => (
              <Card
                key={solution.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-semibold truncate">
                          {solution.exercise.exerciseNumber ||
                            `Վարժություն ${solution.exercise.id.slice(-6)}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {solution.user.name} • {solution.user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(solution.createdAt).toLocaleDateString(
                            "hy-AM"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      {getCorrectnessBadge(solution.isCorrect)}
                      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSolutionDialog(solution)}
                            className="text-sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Դիտել
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                              <span>📋</span>
                              Լուծման մանրամասներ
                            </DialogTitle>
                          </DialogHeader>

                          {selectedSolution && (
                            <div className="space-y-6">
                              {/* Exercise Info */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">
                                  {selectedSolution.exercise.exerciseNumber ||
                                    `Վարժություն ${selectedSolution.exercise.id.slice(
                                      -6
                                    )}`}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Վարժության ID: {selectedSolution.exercise.id}
                                </p>
                              </div>

                              {/* Student's Final Answer */}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Ուսանողի պատասխան
                                </h4>
                                <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                                  {selectedSolution.finalAnswer ||
                                    "Պատասխան չկա"}
                                </p>
                                <div className="mt-2">
                                  {getCorrectnessBadge(
                                    selectedSolution.isCorrect
                                  )}
                                </div>
                              </div>

                              {/* Student Info */}
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">
                                  Ուսանողի տվյալներ
                                </h4>
                                <p>
                                  <strong>Անուն:</strong>{" "}
                                  {selectedSolution.user.name}
                                </p>
                                <p>
                                  <strong>Էլ․ փոստ:</strong>{" "}
                                  {selectedSolution.user.email}
                                </p>
                                <p>
                                  <strong>Ամսաթիվ:</strong>{" "}
                                  {new Date(
                                    selectedSolution.createdAt
                                  ).toLocaleDateString("hy-AM")}
                                </p>
                              </div>

                              {/* Close Button */}
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSolution(null);
                                    setIsModalOpen(false);
                                  }}
                                  className="text-sm"
                                >
                                  Փակել
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>

                {/* Preview of solution content */}
                <CardContent>
                  <div className="text-sm">
                    <span className="font-medium">Պատասխան:</span>
                    <div className="mt-1 font-mono">
                      {solution.finalAnswer || (
                        <span className="text-gray-400 italic">
                          Պատասխան չկա
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
