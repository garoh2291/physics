import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn } from "next-auth/react";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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

interface Exercise {
  id: string;
  title: string;
  exerciseNumber?: string;
  level: number;
  class?: number;
  problemText?: string;
  problemImage?: string;
  givenText?: string;
  givenImage?: string;
  solutionSteps?: string;
  solutionImage?: string;
  correctAnswers: string[];
  hintText1?: string;
  hintImage1?: string;
  hintText2?: string;
  hintImage2?: string;
  hintText3?: string;
  hintImage3?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  tags: Array<{ id: string; name: string; url?: string | null }>;
  sources: Array<{ id: string; name: string; url?: string | null }>;
  sections: Array<{ id: string; name: string; url?: string | null }>;
  themes: Array<{
    id: string;
    name: string;
    url?: string | null;
    section: { id: string; name: string };
  }>;
  solutions: Solution[];
}

interface Tag {
  id: string;
  name: string;
  url?: string | null;
}

interface Source {
  id: string;
  name: string;
  url?: string | null;
}

interface Section {
  id: string;
  name: string;
  url?: string | null;
  themes: Array<{ id: string; name: string; url?: string | null }>;
}

interface Theme {
  id: string;
  name: string;
  url?: string | null;
  section: {
    id: string;
    name: string;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  solutions: Array<{ exerciseId: string; isCorrect: boolean }>;
  hintUsages: Array<{
    exerciseId: string;
    hintLevel: number;
    usedAt: string;
  }>;
}

// API Response Types
interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface SignInResponse {
  error?: string | null;
  ok?: boolean;
  url?: string | null;
}

// API Request Types
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface SubmitSolutionData {
  exerciseId: string;
  finalAnswer: string;
}

interface CreateExerciseData {
  title: string;
  exerciseNumber?: string;
  level: number;
  class?: number;
  problemText?: string;
  problemImage?: string;
  givenText?: string;
  givenImage?: string;
  solutionSteps?: string;
  solutionImage?: string;
  correctAnswers: string[];
  tagIds?: string[];
  sourceIds?: string[];
  sectionIds?: string[];
  themeIds?: string[];
  hintText1?: string;
  hintImage1?: string;
  hintText2?: string;
  hintImage2?: string;
  hintText3?: string;
  hintImage3?: string;
}

interface UpdateExerciseData {
  title: string;
  exerciseNumber?: string;
  level: number;
  class?: number;
  problemText?: string;
  problemImage?: string;
  givenText?: string;
  givenImage?: string;
  solutionSteps?: string;
  solutionImage?: string;
  correctAnswers: string[];
  tagIds?: string[];
  sourceIds?: string[];
  sectionIds?: string[];
  themeIds?: string[];
  hintText1?: string;
  hintImage1?: string;
  hintText2?: string;
  hintImage2?: string;
  hintText3?: string;
  hintImage3?: string;
}

// Exercise Hooks
export const useExercises = () => {
  return useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => {
      const response = await fetch("/api/exercises");
      if (!response.ok) throw new Error("Failed to fetch exercises");
      return response.json();
    },
  });
};

export const useExercise = (id: string) => {
  return useQuery<Exercise>({
    queryKey: ["exercises", id],
    queryFn: async () => {
      const response = await fetch(`/api/exercises/${id}`);
      if (!response.ok) throw new Error("Failed to fetch exercise");
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["exercises"] });
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
    },
  });
};

// Solution Hooks
export const useSolutions = () => {
  return useQuery<Solution[]>({
    queryKey: ["solutions"],
    queryFn: async () => {
      const response = await fetch("/api/solutions");
      if (!response.ok) throw new Error("Failed to fetch solutions");
      return response.json();
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

// User Profile Hooks
export const useUserProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await fetch("/api/user-profile");
      if (!response.ok) throw new Error("Failed to fetch user profile");
      return response.json();
    },
  });
};

// Hint Usage Hooks
export const useHintUsage = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { credits: number; unlockedHints: number[] },
    Error,
    { exerciseId: string; hintLevel: number }
  >({
    mutationFn: async (data) => {
      const response = await fetch("/api/hint-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Հուշման օգտագործման սխալ");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
};

// Tag Hooks
export const useTags = () => {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch("/api/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");
      return response.json();
    },
  });
};

// Source Hooks
export const useSources = () => {
  return useQuery<Source[]>({
    queryKey: ["sources"],
    queryFn: async () => {
      const response = await fetch("/api/sources");
      if (!response.ok) throw new Error("Failed to fetch sources");
      return response.json();
    },
  });
};

// Theme Hooks
export const useSections = () => {
  return useQuery<Section[]>({
    queryKey: ["sections"],
    queryFn: async () => {
      const response = await fetch("/api/sections");
      if (!response.ok) throw new Error("Failed to fetch sections");
      return response.json();
    },
  });
};

export const useThemes = () => {
  return useQuery<Theme[]>({
    queryKey: ["themes"],
    queryFn: async () => {
      const response = await fetch("/api/themes");
      if (!response.ok) throw new Error("Failed to fetch themes");
      return response.json();
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
