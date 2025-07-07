"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  BookOpen,
  Hash,
} from "lucide-react";
import { useSolutions, useUpdateSolutionStatus } from "@/hooks/use-api";

type SolutionStatus =
  | "ALL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_WORK";

interface ReviewDialogData {
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  solution: any;
  action: "APPROVED" | "REJECTED" | "NEEDS_WORK" | null;
}

export default function AdminSolutionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SolutionStatus>("ALL");
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogData>({
    isOpen: false,
    solution: null,
    action: null,
  });
  const [feedback, setFeedback] = useState("");

  const { data: solutions = [], isLoading, error } = useSolutions();
  const updateStatusMutation = useUpdateSolutionStatus();

  // Filter solutions
  const filteredSolutions = solutions.filter((solution) => {
    const matchesSearch =
      solution.exercise.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      solution.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solution.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || solution.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort by priority: PENDING first, then by date
  const sortedSolutions = [...filteredSolutions].sort((a, b) => {
    const statusPriority = {
      PENDING: 0,
      NEEDS_WORK: 1,
      APPROVED: 2,
      REJECTED: 3,
    };
    const aPriority =
      statusPriority[a.status as keyof typeof statusPriority] ?? 4;
    const bPriority =
      statusPriority[b.status as keyof typeof statusPriority] ?? 4;

    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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

  const getStatusCounts = () => {
    const pending = solutions.filter((s) => s.status === "PENDING").length;
    const approved = solutions.filter((s) => s.status === "APPROVED").length;
    const rejected = solutions.filter((s) => s.status === "REJECTED").length;
    const needsWork = solutions.filter((s) => s.status === "NEEDS_WORK").length;
    return { pending, approved, rejected, needsWork, total: solutions.length };
  };

  const statusCounts = getStatusCounts();

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Սխալ՝ {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Վահանակ
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Լուծումների գնահատում
                </h1>
                <p className="text-gray-600">
                  {statusCounts.pending > 0 ? (
                    <span className="text-orange-600 font-medium">
                      {statusCounts.pending} լուծում սպասում է գնահատման
                    </span>
                  ) : (
                    "Բոլոր լուծումները գնահատված են"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ընդամենը
                  </p>
                  <p className="text-2xl font-bold">{statusCounts.total}</p>
                </div>
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Սպասում է
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {statusCounts.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Հաստատված
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {statusCounts.approved}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Կարիք է շտկման
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statusCounts.needsWork}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Փնտրել ըստ վարժության կամ ուսանողի անվան..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: SolutionStatus) =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Բոլոր կարգավիճակները</SelectItem>
                  <SelectItem value="PENDING">Սպասում է</SelectItem>
                  <SelectItem value="APPROVED">Հաստատված</SelectItem>
                  <SelectItem value="REJECTED">Մերժված</SelectItem>
                  <SelectItem value="NEEDS_WORK">Կարիք է շտկման</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Solutions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Լուծումներ</span>
              <Badge variant="outline">{sortedSolutions.length} արդյունք</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedSolutions.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 text-gray-400 mx-auto mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Արդյունքներ չգտնվեցին"
                    : "Լուծումներ չկան"}
                </h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Փորձեք փոխել որոնման պարամետրները"
                    : "Ուսանողները դեռ լուծումներ չեն ուղարկել"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ուսանող</TableHead>
                      <TableHead>Վարժություն</TableHead>
                      <TableHead>Փորձ</TableHead>
                      <TableHead>Ամսաթիվ</TableHead>
                      <TableHead>Պատասխան</TableHead>
                      <TableHead>Ճշտությունը</TableHead>
                      <TableHead>Կարգավիճակ</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSolutions.map((solution) => (
                      <TableRow key={solution.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">
                                {solution.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {solution.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium line-clamp-1">
                              {solution.exercise.title}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Hash className="h-3 w-3 mr-1" />
                              {solution.exercise.id.substring(0, 8)}...
                            </div>
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
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/exercises/${solution.exercise.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Դիտել վարժությունը
                                </Link>
                              </DropdownMenuItem>

                              {solution.status !== "APPROVED" && (
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={() =>
                                    handleReviewAction(solution, "APPROVED")
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Հաստատել
                                </DropdownMenuItem>
                              )}

                              {solution.status !== "NEEDS_WORK" && (
                                <DropdownMenuItem
                                  className="text-yellow-600"
                                  onClick={() =>
                                    handleReviewAction(solution, "NEEDS_WORK")
                                  }
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Կարիք է շտկման
                                </DropdownMenuItem>
                              )}

                              {solution.status !== "REJECTED" && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleReviewAction(solution, "REJECTED")
                                  }
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Մերժել
                                </DropdownMenuItem>
                              )}
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
              Ուսանող՝ <strong>{reviewDialog.solution?.user.name}</strong>
              <br />
              Վարժություն՝{" "}
              <strong>{reviewDialog.solution?.exercise.title}</strong>
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
                placeholder={
                  reviewDialog.action === "APPROVED"
                    ? "Լրացուցիչ մեկնաբանություններ..."
                    : reviewDialog.action === "NEEDS_WORK"
                    ? "Նշեք ինչ պետք է շտկել..."
                    : "Նշեք մերժման պատճառը..."
                }
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
