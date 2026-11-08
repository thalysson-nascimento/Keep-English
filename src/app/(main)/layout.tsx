import type { ReactNode } from "react";
import { AppShell } from "@/shared/components/app-shell";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
