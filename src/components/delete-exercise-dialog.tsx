"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteExercise } from "@/hooks/use-api";

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

  // Cleanup effect to ensure body styles are restored on unmount
  useEffect(() => {
    return () => {
      // Force restore body pointer events when component unmounts
      document.body.style.pointerEvents = "";
    };
  }, []);

  if (!exercise) {
    return null;
  }

  const handleClose = () => {
    // Ensure body pointer events are restored
    document.body.style.pointerEvents = "";
    onClose();
  };

  const handleDeleteConfirm = () => {
    deleteExerciseMutation.mutate(exercise.id, {
      onSuccess: () => {
        document.body.style.pointerEvents = "";
        handleClose();
      },
    });
  };

  const exerciseDisplayName =
    exercise.exerciseNumber ||
    exercise.title ||
    `Վարժություն ${exercise.id.slice(-6)}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Restore body pointer events when dialog closes
          document.body.style.pointerEvents = "";
          handleClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ջնջել վարժությունը</DialogTitle>
          <DialogDescription>
            Դուք վստա՞հ եք, որ ցանկանում եք ջնջել &quot;
            {exerciseDisplayName}&quot; վարժությունը: Այս գործողությունը
            հետադարձելի չէ և ջնջելու է նաև բոլոր հարակից լուծումները:
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Փակել
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deleteExerciseMutation.isPending}
          >
            {deleteExerciseMutation.isPending ? "Ջնջվում..." : "Ջնջել"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
