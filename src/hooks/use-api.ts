import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signIn, type SignInResponse } from "next-auth/react";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Exercise {
  id: string;
  title: string;
  problemText?: string;
  problemImage?: string;
  givenText?: string;
  givenImage?: string;
  solutionSteps?: string;
  solutionImage?: string;
  correctAnswer?: string; // Decrypted for admins
  createdAt: string;
  createdBy?: User;
  tags: Array<{
    id: string;
    name: string;
    url?: string | null;
  }>;
  solutions: Solution[];
}

interface Solution {
  id: string;
  userId: string;
  exerciseId: string;
  finalAnswer?: string;
  isCorrect: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  exercise: {
    id: string;
    title: string;
  };
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface CreateExerciseData {
  title: string;
  problemText?: string;
  problemImage?: string;
  givenText?: string;
  givenImage?: string;
  solutionSteps?: string;
  solutionImage?: string;
  correctAnswer: string;
  tagIds?: string[];
}

interface UpdateExerciseData {
  title: string;
  problemText?: string;
  problemImage?: string;
  givenText?: string;
  givenImage?: string;
  solutionSteps?: string;
  solutionImage?: string;
  correctAnswer: string;
  tagIds?: string[];
}

interface SubmitSolutionData {
  exerciseId: string;
  finalAnswer: string;
}

// Exercise Hooks
export const useExercises = () => {
  return useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => {
      const response = await fetch("/api/exercises");
      if (!response.ok) throw new Error("Վարժությունները բեռնելու սխալ");
      return response.json();
    },
  });
};

export const useExercise = (id: string) => {
  return useQuery<Exercise>({
    queryKey: ["exercises", id],
    queryFn: async () => {
      const response = await fetch(`/api/exercises/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Վարժությունը չգտնվեց");
        throw new Error("Վարժությունը բեռնելու սխալ");
      }
      return response.json();
    },
    enabled: !!id,
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation<Exercise, Error, CreateExerciseData>({
    mutationFn: async (data) => {
      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Վարժության ստեղծման սխալ");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation<Exercise, Error, { id: string; data: UpdateExerciseData }>(
    {
      mutationFn: async ({ id, data }) => {
        const response = await fetch(`/api/exercises/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Վարժության թարմացման սխալ");
        return result;
      },
      onSuccess: (updatedExercise) => {
        queryClient.invalidateQueries({ queryKey: ["exercises"] });
        queryClient.invalidateQueries({
          queryKey: ["exercises", updatedExercise.id],
        });
      },
    }
  );
};

// PATCH hook for Exercise
export const usePatchExercise = () => {
  const queryClient = useQueryClient();
  return useMutation<Exercise, Error, { id: string; data: UpdateExerciseData }>(
    {
      mutationFn: async ({ id, data }) => {
        const response = await fetch(`/api/exercises/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Վարժության թարմացման սխալ");
        return result;
      },
      onSuccess: (updatedExercise) => {
        queryClient.invalidateQueries({ queryKey: ["exercises"] });
        queryClient.invalidateQueries({
          queryKey: ["exercises", updatedExercise.id],
        });
      },
    }
  );
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Վարժության ջնջման սխալ");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["solutions"] });
    },
  });
};

// Solution Hooks
export const useSolutions = () => {
  return useQuery<Solution[]>({
    queryKey: ["solutions"],
    queryFn: async () => {
      const response = await fetch("/api/solutions");
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Լուծումները բեռնելու սխալ");
      return result;
    },
  });
};

export const useSubmitSolution = () => {
  const queryClient = useQueryClient();
  return useMutation<Solution, Error, SubmitSolutionData>({
    mutationFn: async (data) => {
      const response = await fetch("/api/solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Լուծման ուղարկման սխալ");
      return result;
    },
    onSuccess: (newSolution) => {
      // Invalidate solutions list
      queryClient.invalidateQueries({ queryKey: ["solutions"] });

      // Invalidate exercises list to update solution counts
      queryClient.invalidateQueries({ queryKey: ["exercises"] });

      // Invalidate specific exercise to update its solutions
      queryClient.invalidateQueries({
        queryKey: ["exercises", newSolution.exerciseId],
      });
    },
  });
};

// PATCH hook for ExerciseAnswer
interface PatchExerciseAnswerData {
  exerciseId: string;
  correctAnswer?: string;
  givenData?: string;
  solutionSteps?: string;
  solutionImage?: string;
}

interface PatchExerciseAnswerResponse {
  message: string;
  exerciseAnswer: {
    id: string;
    exerciseId: string;
    correctAnswer: string;
    givenData?: string;
    solutionSteps?: string;
    solutionImage?: string;
    createdAt: string;
  };
}

export const usePatchExerciseAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation<
    PatchExerciseAnswerResponse,
    Error,
    PatchExerciseAnswerData
  >({
    mutationFn: async (data) => {
      const response = await fetch(`/api/exercises/${data.exerciseId}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Պատասխանի թարմացման սխալ");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
};

// Auth Hooks
export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Գրանցման սխալ");
      return result;
    },
  });
};

export const useRegisterAdmin = () => {
  return useMutation<
    RegisterResponse,
    Error,
    RegisterData & { role: "ADMIN" | "SUPERADMIN" }
  >({
    mutationFn: async (data) => {
      const response = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Գրանցման սխալ");
      return result;
    },
  });
};

export const useLogin = () => {
  return useMutation<SignInResponse | undefined, Error, LoginData>({
    mutationFn: async (data) => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) throw new Error("Սխալ էլ. փոստ կամ գաղտնաբառ");
      return result;
    },
  });
};
