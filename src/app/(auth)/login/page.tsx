import { connection } from "next/server";
import { AuthForm } from "@/features/auth/presentation/auth-form";

export default async function LoginPage() {
  await connection();

  return (
    <AuthForm
      initialEmail={process.env.LOGIN_DEFAULT_EMAIL}
      initialPassword={process.env.LOGIN_DEFAULT_PASSWORD}
      mode="login"
    />
  );
}
