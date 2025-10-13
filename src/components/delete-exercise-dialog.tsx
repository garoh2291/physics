"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDeleteExercise } from "@/hooks/use-api";
import { X } from "lucide-react";

interface DeleteExerciseDialogProps {
  exercise: {
    id: string;
    title?: string;
    exerciseNumber?: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

export function DeleteExerciseDialog({
  exercise,
  open,
  onClose,
}: DeleteExerciseDialogProps) {
  const deleteExerciseMutation = useDeleteExercise();

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onClose]);

  if (!exercise || !open) {
    return null;
  }

  const handleDeleteConfirm = () => {
    deleteExerciseMutation.mutate(exercise.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const exerciseDisplayName =
    exercise.exerciseNumber ||
    exercise.title ||
    `Վարժություն ${exercise.id.slice(-6)}`;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full max-h-[85vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Ջնջել վարժությունը</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            disabled={deleteExerciseMutation.isPending}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600">
            Դուք վստա՞հ եք, որ ցանկանում եք ջնջել &quot;
            {exerciseDisplayName}&quot; վարժությունը: Այս գործողությունը
            հետադարձելի չէ և ջնջելու է նաև բոլոր հարակից լուծումները:
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteExerciseMutation.isPending}
          >
            Փակել
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deleteExerciseMutation.isPending}
          >
            {deleteExerciseMutation.isPending ? "Ջնջվում..." : "Ջնջել"}
          </Button>
        </div>
      </div>
    </div>
  );
}
