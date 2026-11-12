import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Nunito } from "next/font/google";
import { RequestLocaleProvider } from "@/shared/i18n/request-locale-provider";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Keep English",
  description: "Keep English",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body>
        <Suspense
          fallback={<div aria-busy="true" className="locale-loading" />}
        >
          <RequestLocaleProvider>{children}</RequestLocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
