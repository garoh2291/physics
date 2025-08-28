"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Hash,
  Eye,
  MessageSquare,
} from "lucide-react";
import { FileViewer } from "@/components/ui/file-viewer";
import { useExercise } from "@/hooks/use-api";

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
          background: #f3f4f6;
          color: #1f2937;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: "Monaco", "Menlo", "Consolas", monospace;
          font-size: 0.875em;
        }

        .math-content-display :global(pre) {
          background: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .math-content-display :global(pre code) {
          background: none;
          color: inherit;
          padding: 0;
        }

        .math-content-display :global(ul) {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }

        .math-content-display :global(ol) {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }

        .math-content-display :global(li) {
          margin: 0.25rem 0;
        }

        .math-content-display :global(blockquote) {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
          font-style: italic;
        }

        .math-content-display :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .math-content-display :global(th) {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
          font-weight: 600;
        }

        .math-content-display :global(td) {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
        }

        .math-content-display :global(tr:nth-child(even)) {
          background: #f9fafb;
        }
      `}</style>
      <div className="math-content-display">
        <ReactMarkdown>{decodedContent}</ReactMarkdown>
      </div>
    </>
  );
}

export default function AdminExerciseDetailPage() {
  const params = useParams();
  const exerciseId = params.id as string;
  const [selectedSolution, setSelectedSolution] = useState<{
    id: string;
    user: { name: string; email: string };
    finalAnswer?: string;
    isCorrect: boolean;
    createdAt: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: exercise, isLoading, error } = useExercise(exerciseId);

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

  const openSolutionDialog = (solution: {
    id: string;
    user: { name: string; email: string };
    finalAnswer?: string;
    isCorrect: boolean;
    createdAt: string;
  }) => {
    setSelectedSolution(solution);
    setIsModalOpen(true);
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
  const correctCount = solutions.filter((s) => s.isCorrect).length;
  const incorrectCount = solutions.filter((s) => !s.isCorrect).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/exercises">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Վարժություններ</span>
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {exercise.exerciseNumber || `Վարժություն ${exercise.id.slice(-6)}`}
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  {solutions.length} ուսանող է լուծել
                </p>
              </div>
            </div>
            <Button variant="outline" asChild className="w-full sm:w-auto">
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
              {exercise.problemImage && (
                <FileViewer
                  url={exercise.problemImage}
                  title="Խնդիրի նկար"
                  className="mb-4"
                />
              )}
              {exercise.problemText && (
                <MathContent content={exercise.problemText} />
              )}
            </div>

            {/* Right Answer Section */}
            <div>
              <h3 className="font-medium mb-2">Ճիշտ պատասխաններ</h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                {exercise.correctAnswerValues && exercise.correctAnswerValues.length > 0 ? (
                  <div className="space-y-2">
                    {exercise.correctAnswerValues.map((answer, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-mono text-green-800">
                          Պատասխան {index + 1}: {answer}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-700">Ճիշտ պատասխաններ չկան</p>
                )}
              </div>
            </div>

            {/* Solution Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Ճիշտ պատասխաններ
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {correctCount}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">
                    Սխալ պատասխաններ
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {incorrectCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solutions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ուսանողների լուծումներ</CardTitle>
          </CardHeader>
          <CardContent>
            {solutions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Դեռ ոչ ոք չի լուծել այս վարժությունը
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ուսանող</TableHead>
                      <TableHead>Պատասխան</TableHead>
                      <TableHead>Կարգավիճակ</TableHead>
                      <TableHead>Ամսաթիվ</TableHead>
                      <TableHead>Գործողություններ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solutions.map((solution) => (
                      <TableRow key={solution.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{solution.user.name}</p>
                            <p className="text-sm text-gray-500">
                              {solution.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">
                            {solution.finalAnswerValue || "Պատասխան չկա"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getCorrectnessBadge(solution.isCorrect)}
                        </TableCell>
                        <TableCell>
                          {new Date(solution.createdAt).toLocaleDateString(
                            "hy-AM"
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog
                            open={isModalOpen}
                            onOpenChange={setIsModalOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openSolutionDialog(solution)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Դիտել
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Լուծման մանրամասներ</DialogTitle>
                                <DialogDescription>
                                  Ուսանող՝{" "}
                                  <strong>
                                    {selectedSolution?.user?.name}
                                  </strong>
                                </DialogDescription>
                              </DialogHeader>

                              {selectedSolution && (
                                <div className="space-y-6">
                                  {/* Final Answer */}
                                  <div>
                                    <h3 className="font-medium mb-2">
                                      Ուսանողի պատասխան
                                    </h3>
                                    <div className="bg-gray-100 p-3 rounded">
                                      <span className="font-mono text-lg">
                                        {selectedSolution.finalAnswer ||
                                          "Պատասխան չկա"}
                                      </span>
                                    </div>
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
                                    >
                                      Փակել
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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
    </div>
  );
}
