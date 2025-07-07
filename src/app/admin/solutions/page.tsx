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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MessageSquare,
} from "lucide-react";
import { useSolutions } from "@/hooks/use-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Solution = {
  id: string;
  userId: string;
  exerciseId: string;
  givenData?: string;
  solutionSteps?: string;
  finalAnswer?: string;
  isCorrect: boolean;
  status: string;
  adminFeedback?: string;
  attemptNumber: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  exercise: {
    id: string;
    title: string;
    problemText?: string;
  };
};

// Math Content Display Component
function MathContent({ content }: { content?: string }) {
  if (!content)
    return <p className="text-gray-500 italic">Բովանդակություն չկա</p>;

  const decodedContent = content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return (
    <div
      className="math-content-display"
      dangerouslySetInnerHTML={{ __html: decodedContent }}
    />
  );
}

export default function AdminSolutionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(
    null
  );
  const [feedback, setFeedback] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: solutions, isLoading, error } = useSolutions();
  const queryClient = useQueryClient();

  // Custom mutation with modal state management
  const updateStatusMutation = useMutation({
    mutationFn: async (data: {
      solutionId: string;
      status: "APPROVED" | "REJECTED" | "NEEDS_WORK";
      adminFeedback?: string;
    }) => {
      const { solutionId, ...updateData } = data;
      const response = await fetch(`/api/solutions/${solutionId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Կարգավիճակի թարմացման սխալ");
      return result;
    },
    onSuccess: (updatedSolution: Solution) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["solutions"] });
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({
        queryKey: ["exercises", updatedSolution.exerciseId],
      });

      // Clear modal state
      setFeedback("");
      setSelectedSolution(null);
    },
  });

  const filteredSolutions =
    solutions?.filter((solution) => {
      if (statusFilter === "ALL") return true;
      return solution.status === statusFilter;
    }) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "outline" as const,
        icon: Clock,
        text: "Սպասում է",
        className: "text-orange-600",
      },
      APPROVED: {
        variant: "outline" as const,
        icon: CheckCircle,
        text: "Հաստատված",
        className: "text-green-600",
      },
      REJECTED: {
        variant: "outline" as const,
        icon: XCircle,
        text: "Մերժված",
        className: "text-red-600",
      },
      NEEDS_WORK: {
        variant: "outline" as const,
        icon: AlertTriangle,
        text: "Կարիք է շտկման",
        className: "text-yellow-600",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const handleStatusUpdate = async (solutionId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        solutionId,
        status: newStatus as "APPROVED" | "REJECTED" | "NEEDS_WORK",
        adminFeedback: feedback.trim() || undefined,
      });
      // Don't clear state here - let the mutation's onSuccess handle it
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openReviewDialog = (solution: Solution) => {
    setSelectedSolution(solution);
    setFeedback(solution.adminFeedback || "");
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Լուծումների վերանայում
              </h1>
              <p className="text-gray-600 mt-1">
                Ընդհանուր՝ {solutions?.length || 0} լուծում
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ընտրել կարգավիճակ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Բոլորը</SelectItem>
                  <SelectItem value="PENDING">Սպասում է</SelectItem>
                  <SelectItem value="APPROVED">Հաստատված</SelectItem>
                  <SelectItem value="REJECTED">Մերժված</SelectItem>
                  <SelectItem value="NEEDS_WORK">Կարիք է շտկման</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {filteredSolutions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Լուծումներ չկան</p>
                <p className="text-sm">
                  Ընտրված կարգավիճակով լուծումներ չեն գտնվել
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredSolutions.map((solution) => (
              <Card
                key={solution.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {solution.exercise.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {solution.user.name} • {solution.user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Փորձ #{solution.attemptNumber} •{" "}
                          {new Date(solution.createdAt).toLocaleDateString(
                            "hy-AM"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(solution.status)}
                      {solution.isCorrect && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ճիշտ պատասխան
                        </Badge>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReviewDialog(solution)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Դիտել
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <span>🔍</span>
                              Լուծման վերանայում
                            </DialogTitle>
                          </DialogHeader>

                          {selectedSolution && (
                            <div className="space-y-6">
                              {/* Exercise Info */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Խնդիր</h4>
                                <MathContent
                                  content={
                                    selectedSolution.exercise.problemText
                                  }
                                />
                              </div>

                              {/* Student's Given Data */}
                              <div>
                                <h4 className="font-semibold mb-2">Տրված է</h4>
                                <MathContent
                                  content={selectedSolution.givenData}
                                />
                              </div>

                              {/* Student's Solution Steps */}
                              <div>
                                <h4 className="font-semibold mb-2">Լուծում</h4>
                                <MathContent
                                  content={selectedSolution.solutionSteps}
                                />
                              </div>

                              {/* Student's Final Answer */}
                              <div>
                                <h4 className="font-semibold mb-2">Պատասխան</h4>
                                <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                                  {selectedSolution.finalAnswer ||
                                    "Պատասխան չկա"}
                                </p>
                              </div>

                              {/* Admin Feedback */}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Ձեր մեկնաբանությունը
                                </h4>
                                <Textarea
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Գրեք ձեր մեկնաբանությունը..."
                                  rows={4}
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSolution(null);
                                    setFeedback("");
                                  }}
                                >
                                  Չեղարկել
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      selectedSolution.id,
                                      "REJECTED"
                                    )
                                  }
                                  disabled={isUpdating}
                                >
                                  Մերժել
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      selectedSolution.id,
                                      "NEEDS_WORK"
                                    )
                                  }
                                  disabled={isUpdating}
                                >
                                  Կարիք է շտկման
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      selectedSolution.id,
                                      "APPROVED"
                                    )
                                  }
                                  disabled={isUpdating}
                                >
                                  Հաստատել
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Տրված է:</span>
                      <div className="mt-1 text-gray-600 line-clamp-2">
                        {solution.givenData ? (
                          <MathContent content={solution.givenData} />
                        ) : (
                          <span className="text-gray-400 italic">
                            Բովանդակություն չկա
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Լուծում:</span>
                      <div className="mt-1 text-gray-600 line-clamp-2">
                        {solution.solutionSteps ? (
                          <MathContent content={solution.solutionSteps} />
                        ) : (
                          <span className="text-gray-400 italic">
                            Բովանդակություն չկա
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Պատասխան:</span>
                      <div className="mt-1 font-mono">
                        {solution.finalAnswer || (
                          <span className="text-gray-400 italic">
                            Պատասխան չկա
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {solution.adminFeedback && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Մեկնաբանություն:</span>{" "}
                        {solution.adminFeedback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
