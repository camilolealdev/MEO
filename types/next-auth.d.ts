import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    tier?: "free" | "pro" | "agency";
    role?: "user" | "admin";
  }
  interface Session {
    user: {
      id: string;
      tier: "free" | "pro" | "agency";
      role: "user" | "admin";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tier: "free" | "pro" | "agency";
    role: "user" | "admin";
  }
}
