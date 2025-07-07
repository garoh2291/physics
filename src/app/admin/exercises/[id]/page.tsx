"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Hash,
} from "lucide-react";
import { useExercise, useUpdateSolutionStatus } from "@/hooks/use-api";

interface ReviewDialogData {
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  solution: any;
  action: "APPROVED" | "REJECTED" | "NEEDS_WORK" | null;
}

// Math Content Display Component with Markdown support
function MathContent({ content }: { content: string }) {
  // Decode HTML entities and process the markdown
  const decodedContent = content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return (
    <>
      {/* Add CSS styles for math content */}
      <style jsx>{`
        .math-content-display :global(.math-formula) {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid #93c5fd;
          font-family: "Times New Roman", "Cambria Math", serif;
          font-weight: 500;
          font-size: 1.05em;
          display: inline-block;
          margin: 0 2px;
          box-shadow: 0 1px 2px rgba(59, 130, 246, 0.1);
          transition: all 0.2s ease;
        }

        .math-content-display :global(.math-formula:hover) {
          background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }

        .math-content-display :global(.math-var) {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
          color: #7c3aed;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #c4b5fd;
          font-family: "Times New Roman", "Cambria Math", serif;
          font-weight: 600;
          font-style: italic;
          font-size: 1.1em;
          display: inline-block;
          margin: 0 1px;
          box-shadow: 0 1px 2px rgba(124, 58, 237, 0.1);
          transition: all 0.2s ease;
        }

        .math-content-display :global(.math-var:hover) {
          background: linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%);
          box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);
        }

        .math-content-display :global(.math-unit) {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          color: #059669;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #a7f3d0;
          font-family: "Monaco", "Menlo", "Consolas", monospace;
          font-weight: 500;
          font-size: 0.9em;
          display: inline-block;
          margin: 0 1px;
          box-shadow: 0 1px 2px rgba(5, 150, 105, 0.1);
          transition: all 0.2s ease;
        }

        .math-content-display :global(.math-unit:hover) {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
        }

        .math-content-display {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
            "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
            "Helvetica Neue", sans-serif;
          line-height: 1.6;
          color: #374151;
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .math-content-display :global(h1) {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        .math-content-display :global(h1:first-child) {
          margin-top: 0;
        }

        .math-content-display :global(h2) {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.3;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .math-content-display :global(h3) {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .math-content-display :global(p) {
          margin: 0.75rem 0;
          line-height: 1.6;
        }

        .math-content-display :global(p:first-child) {
          margin-top: 0;
        }

        .math-content-display :global(p:last-child) {
          margin-bottom: 0;
        }

        .math-content-display :global(strong) {
          font-weight: 700;
          color: #111827;
        }

        .math-content-display :global(em) {
          font-style: italic;
          color: #374151;
        }

        .math-content-display :global(code) {
          background-color: #f3f4f6;
          color: #1f2937;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: "Monaco", "Menlo", "Consolas", monospace;
          font-size: 0.875em;
        }

        .math-content-display :global(ul),
        .math-content-display :global(ol) {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }

        .math-content-display :global(li) {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .math-content-display :global(blockquote) {
          border-left: 4px solid #3b82f6;
          background-color: #f8fafc;
          padding: 1rem 1.5rem;
          margin: 1rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
      `}</style>

      <div className="math-content-display">
        <ReactMarkdown
          components={{
            // Custom component to handle HTML spans within markdown
            p: ({ children }) => {
              // Convert any remaining HTML spans to proper elements
              if (typeof children === "string") {
                const processedChildren = children
                  .replace(
                    /<span class="math-formula">(.*?)<\/span>/g,
                    '<span class="math-formula">$1</span>'
                  )
                  .replace(
                    /<span class="math-var">(.*?)<\/span>/g,
                    '<span class="math-var">$1</span>'
                  )
                  .replace(
                    /<span class="math-unit">(.*?)<\/span>/g,
                    '<span class="math-unit">$1</span>'
                  );

                return (
                  <p dangerouslySetInnerHTML={{ __html: processedChildren }} />
                );
              }
              return <p>{children}</p>;
            },
            // Handle other markdown elements normally
            h1: ({ children }) => <h1>{children}</h1>,
            h2: ({ children }) => <h2>{children}</h2>,
            h3: ({ children }) => <h3>{children}</h3>,
            strong: ({ children }) => <strong>{children}</strong>,
            em: ({ children }) => <em>{children}</em>,
            code: ({ children }) => <code>{children}</code>,
            ul: ({ children }) => <ul>{children}</ul>,
            ol: ({ children }) => <ol>{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
            blockquote: ({ children }) => <blockquote>{children}</blockquote>,
          }}
        >
          {decodedContent}
        </ReactMarkdown>
      </div>
    </>
  );
}

export default function AdminExerciseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogData>({
    isOpen: false,
    solution: null,
    action: null,
  });
  const [feedback, setFeedback] = useState("");

  const { data: exercise, isLoading, error } = useExercise(params.id);
  const updateStatusMutation = useUpdateSolutionStatus();

  const handleReviewAction = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    solution: any,
    action: "APPROVED" | "REJECTED" | "NEEDS_WORK"
  ) => {
    setReviewDialog({
      isOpen: true,
      solution,
      action,
    });
    setFeedback(solution.adminFeedback || "");
  };

  const handleReviewConfirm = () => {
    if (!reviewDialog.solution || !reviewDialog.action) return;

    updateStatusMutation.mutate(
      {
        solutionId: reviewDialog.solution.id,
        status: reviewDialog.action,
        adminFeedback: feedback.trim() || undefined,
      },
      {
        onSuccess: () => {
          setReviewDialog({ isOpen: false, solution: null, action: null });
          setFeedback("");
        },
      }
    );
  };

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

  const getActionButtonText = (action: string) => {
    switch (action) {
      case "APPROVED":
        return "Հաստատել";
      case "REJECTED":
        return "Մերժել";
      case "NEEDS_WORK":
        return "Կարիք է շտկման";
      default:
        return "";
    }
  };

  const getActionButtonColor = (action: string) => {
    switch (action) {
      case "APPROVED":
        return "text-green-600";
      case "REJECTED":
        return "text-red-600";
      case "NEEDS_WORK":
        return "text-yellow-600";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Բեռնվում...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              {error?.message || "Վարժությունը չգտնվեց"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const solutions = exercise.solutions || [];
  const statusCounts = {
    pending: solutions.filter((s) => s.status === "PENDING").length,
    approved: solutions.filter((s) => s.status === "APPROVED").length,
    rejected: solutions.filter((s) => s.status === "REJECTED").length,
    needsWork: solutions.filter((s) => s.status === "NEEDS_WORK").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/exercises">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Վարժություններ
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {exercise.title}
                </h1>
                <p className="text-gray-600">
                  {solutions.length} լուծում ստացվել է
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/admin/exercises/${exercise.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Խմբագրել
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Exercise Details */}
        <Card>
          <CardHeader>
            <CardTitle>Վարժության մանրամասներ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">ID:</span>
                <span className="text-sm font-mono">{exercise.id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Ստեղծվել է:</span>
                <span className="text-sm">
                  {new Date(exercise.createdAt).toLocaleDateString("hy-AM")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Ստեղծող:</span>
                <span className="text-sm">
                  {exercise.createdBy?.name || "Անհայտ"}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Խնդիրի նկարագրություն</h3>
              <MathContent content={exercise.problemText} />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {statusCounts.pending}
                </div>
                <p className="text-sm text-gray-600">Սպասում է</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statusCounts.approved}
                </div>
                <p className="text-sm text-gray-600">Հաստատված</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {statusCounts.needsWork}
                </div>
                <p className="text-sm text-gray-600">Կարիք է շտկման</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {statusCounts.rejected}
                </div>
                <p className="text-sm text-gray-600">Մերժված</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solutions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ուսանողների լուծումներ</CardTitle>
          </CardHeader>
          <CardContent>
            {solutions.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 text-gray-400 mx-auto mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Լուծումներ չկան
                </h3>
                <p className="text-gray-500">
                  Ուսանողները դեռ լուծումներ չեն ուղարկել այս վարժության համար:
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ուսանող</TableHead>
                      <TableHead>Փորձ</TableHead>
                      <TableHead>Ամսաթիվ</TableHead>
                      <TableHead>Պատասխան</TableHead>
                      <TableHead>Ճշտությունը</TableHead>
                      <TableHead>Կարգավիճակ</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solutions.map((solution) => (
                      <TableRow key={solution.id}>
                        <TableCell>
                          <div className="font-medium">
                            {solution.user?.name || "Անհայտ"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {solution.user?.email || ""}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {solution.attemptNumber}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {new Date(solution.createdAt).toLocaleDateString(
                              "hy-AM",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm font-mono bg-gray-100 p-2 rounded line-clamp-2">
                              {solution.finalAnswer || "Պատասխան չտրված"}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              solution.isCorrect ? "default" : "secondary"
                            }
                          >
                            {solution.isCorrect ? "Ճիշտ" : "Սխալ"}
                          </Badge>
                        </TableCell>

                        <TableCell>{getStatusBadge(solution.status)}</TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() =>
                                  handleReviewAction(solution, "APPROVED")
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Հաստատել
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-yellow-600"
                                onClick={() =>
                                  handleReviewAction(solution, "NEEDS_WORK")
                                }
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Կարիք է շտկման
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleReviewAction(solution, "REJECTED")
                                }
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Մերժել
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.isOpen}
        onOpenChange={(open) =>
          !open &&
          setReviewDialog({ isOpen: false, solution: null, action: null })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {getActionButtonText(reviewDialog.action || "")} լուծումը
            </DialogTitle>
            <DialogDescription>
              Ուսանող՝ <strong>{reviewDialog.solution?.user?.name}</strong>
              <br />
              Փորձ նիշ՝ <strong>{reviewDialog.solution?.attemptNumber}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">
                Ադմինի գրադարան{" "}
                {reviewDialog.action === "REJECTED" ||
                reviewDialog.action === "NEEDS_WORK"
                  ? "*"
                  : "(ոչ պարտադիր)"}
              </Label>
              <Textarea
                id="feedback"
                placeholder="Գրադարան ուսանողի համար..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setReviewDialog({ isOpen: false, solution: null, action: null })
              }
            >
              Չեղարկել
            </Button>
            <Button
              className={getActionButtonColor(reviewDialog.action || "")}
              onClick={handleReviewConfirm}
              disabled={
                updateStatusMutation.isPending ||
                ((reviewDialog.action === "REJECTED" ||
                  reviewDialog.action === "NEEDS_WORK") &&
                  !feedback.trim())
              }
            >
              {updateStatusMutation.isPending && "Պահպանվում..."}
              {!updateStatusMutation.isPending &&
                getActionButtonText(reviewDialog.action || "")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
