import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signIn } from "next-auth/react";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Exercise {
  id: string;
  title: string;
  problemText: string;
  createdAt: string;
  createdBy?: User;
  solutions: Solution[];
}

interface Solution {
  id: string;
  userId: string;
  exerciseId: string;
  givenData?: string;
  solutionSteps?: string;
  finalAnswer?: string;
  isCorrect: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_WORK";
  adminFeedback?: string;
  attemptNumber: number;
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
  problemText: string;
}

interface UpdateSolutionStatusData {
  solutionId: string;
  status: "APPROVED" | "REJECTED" | "NEEDS_WORK";
  adminFeedback?: string;
}

// API Functions
const api = {
  // Exercises
  getExercises: async (): Promise<Exercise[]> => {
    const response = await fetch("/api/exercises");
    if (!response.ok) throw new Error("Վարժությունները բեռնելու սխալ");
    return response.json();
  },

  getExercise: async (id: string): Promise<Exercise> => {
    const response = await fetch(`/api/exercises/${id}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error("Վարժությունը չգտնվեց");
      throw new Error("Վարժությունը բեռնելու սխալ");
    }
    return response.json();
  },

  createExercise: async (data: CreateExerciseData): Promise<Exercise> => {
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

  deleteExercise: async (id: string): Promise<void> => {
    const response = await fetch(`/api/exercises/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Վարժության ջնջման սխալ");
    }
  },

  // Solutions
  getSolutions: async (): Promise<Solution[]> => {
    const response = await fetch("/api/solutions");
    if (!response.ok) throw new Error("Լուծումները բեռնելու սխալ");
    return response.json();
  },

  updateSolutionStatus: async (
    data: UpdateSolutionStatusData
  ): Promise<Solution> => {
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

  // Registration
  register: async (data: RegisterData) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Գրանցման սխալ");
    return result;
  },

  // Admin Registration
  registerAdmin: async (
    data: RegisterData & { role: "ADMIN" | "SUPERADMIN" }
  ) => {
    const response = await fetch("/api/auth/register-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Գրանցման սխալ");
    return result;
  },

  // Login
  login: async (data: LoginData) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) throw new Error("Սխալ էլ. փոստ կամ գաղտնաբառ");
    return result;
  },
};

// Exercise Hooks
export const useExercises = () => {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: api.getExercises,
  });
};

export const useExercise = (id: string) => {
  return useQuery({
    queryKey: ["exercises", id],
    queryFn: () => api.getExercise(id),
    enabled: !!id,
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteExercise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["solutions"] });
    },
  });
};

// Solution Hooks
export const useSolutions = () => {
  return useQuery({
    queryKey: ["solutions"],
    queryFn: api.getSolutions,
  });
};

export const useUpdateSolutionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateSolutionStatus,
    onSuccess: (updatedSolution) => {
      // Invalidate solutions list
      queryClient.invalidateQueries({ queryKey: ["solutions"] });

      // Invalidate exercises list to update solution counts
      queryClient.invalidateQueries({ queryKey: ["exercises"] });

      // Invalidate specific exercise to update its solutions
      queryClient.invalidateQueries({
        queryKey: ["exercises", updatedSolution.exerciseId],
      });
    },
  });
};

// Auth Hooks
export const useRegister = () => {
  return useMutation({
    mutationFn: api.register,
  });
};

export const useRegisterAdmin = () => {
  return useMutation({
    mutationFn: api.registerAdmin,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: api.login,
  });
};
