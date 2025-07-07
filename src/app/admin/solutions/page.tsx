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
  solutionImage?: string;
  finalAnswer?: string;
  isCorrect: boolean;
  status: string;
  adminFeedback?: string;
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
    problemImage?: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      // Clear modal state and close modal
      setFeedback("");
      setSelectedSolution(null);
      setIsModalOpen(false);
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                Լուծումների վերանայում
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Ընդհանուր՝ {solutions?.length || 0} լուծում
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 text-sm">
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
                          {solution.exercise.title}
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
                      {getStatusBadge(solution.status)}
                      {solution.isCorrect && (
                        <Badge
                          variant="outline"
                          className="text-green-600 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ճիշտ պատասխան
                        </Badge>
                      )}
                      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReviewDialog(solution)}
                            className="text-sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Դիտել
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                              <span>🔍</span>
                              Լուծման վերանայում
                            </DialogTitle>
                          </DialogHeader>

                          {selectedSolution && (
                            <div className="space-y-6">
                              {/* Exercise Info */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Խնդիր</h4>
                                {selectedSolution.exercise.problemImage && (
                                  <div className="mb-4">
                                    <img
                                      src={
                                        selectedSolution.exercise.problemImage
                                      }
                                      alt="Խնդիրի նկար"
                                      className="max-w-full h-auto rounded-lg border"
                                    />
                                  </div>
                                )}
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
                                {selectedSolution.solutionImage && (
                                  <div className="mt-4">
                                    <h5 className="font-medium mb-2">
                                      Լուծման նկար
                                    </h5>
                                    <img
                                      src={selectedSolution.solutionImage}
                                      alt="Լուծման նկար"
                                      className="max-w-full h-auto rounded-lg border"
                                    />
                                  </div>
                                )}
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
                              <div className="flex flex-col sm:flex-row justify-end gap-2">
                                {selectedSolution.status === "APPROVED" && (
                                  <div className="text-sm text-green-600 font-medium flex items-center">
                                    ✅ Այս լուծումն արդեն հաստատված է
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSolution(null);
                                    setFeedback("");
                                    setIsModalOpen(false);
                                  }}
                                  className="text-sm"
                                >
                                  Փակել
                                </Button>
                                {selectedSolution.status !== "APPROVED" && (
                                  <>
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          selectedSolution.id,
                                          "REJECTED"
                                        )
                                      }
                                      disabled={isUpdating}
                                      className="text-sm"
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
                                      className="text-sm"
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
                                      className="text-sm"
                                    >
                                      Հաստատել
                                    </Button>
                                  </>
                                )}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
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
