import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      studiedPlace?: string | null;
      isOnboarded?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    studiedPlace?: string | null;
    isOnboarded?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    studiedPlace?: string | null;
    isOnboarded?: boolean;
  }
}
