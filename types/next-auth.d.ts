import "next-auth";

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
