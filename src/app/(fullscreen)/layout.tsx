import type { ReactNode } from "react";

export default function FullscreenLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <main className="fullscreen-layout">{children}</main>;
}
