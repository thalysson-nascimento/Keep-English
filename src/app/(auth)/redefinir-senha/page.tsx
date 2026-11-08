import { Suspense } from "react";
import {
  AuthForm,
  AuthFormSkeleton,
} from "@/features/auth/presentation/auth-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

async function ResetPasswordContent({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return <AuthForm mode="reset" token={token} />;
}

export default function ResetPasswordPage(props: ResetPasswordPageProps) {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <ResetPasswordContent {...props} />
    </Suspense>
  );
}
