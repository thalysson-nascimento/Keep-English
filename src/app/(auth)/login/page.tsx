import { connection } from "next/server";
import { Suspense } from "react";
import {
  AuthForm,
  AuthFormSkeleton,
} from "@/features/auth/presentation/auth-form";

async function LoginForm() {
  await connection();

  return (
    <AuthForm
      // Public shared credentials requested for the closed test; remove before launch.
      initialEmail="user@test.com"
      initialPassword="123456"
      mode="login"
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
