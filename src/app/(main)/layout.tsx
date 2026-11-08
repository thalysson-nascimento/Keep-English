import type { ReactNode } from "react";
import { Suspense } from "react";
import { HomeHeaderStats } from "@/features/home/presentation/home-header-stats";
import { AppShell } from "@/shared/components/app-shell";
import styles from "@/shared/components/app-shell.module.css";
import { requireCurrentUserId } from "@/core/auth/session";

async function AuthenticatedMainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const userId = await requireCurrentUserId();
  return (
    <AppShell
      headerStats={
        <Suspense fallback={<div className={styles.headerStatsSkeleton} />}>
          <HomeHeaderStats userId={userId} />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Suspense
      fallback={<div aria-busy="true" className={styles.shellLoading} />}
    >
      <AuthenticatedMainLayout>{children}</AuthenticatedMainLayout>
    </Suspense>
  );
}
