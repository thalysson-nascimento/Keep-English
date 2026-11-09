"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./app-shell.module.css";

interface AppShellProps {
  children: ReactNode;
  headerStats: ReactNode;
}

const navigationItems = [
  { href: "/", label: "navigation.home", icon: "🏠" },
  { href: "/palavras", label: "navigation.words", icon: "📚" },
  { href: "/testes", label: "navigation.tests", icon: "🎯" },
  { href: "/ranking", label: "navigation.ranking", icon: "🏆" },
  { href: "/perfil", label: "navigation.profile", icon: "👤" },
] as const;

function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, headerStats }: AppShellProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link
          className={styles.brand}
          href="/"
          aria-label={t("navigation.brand")}
        >
          <span className={styles.brandMark} aria-hidden="true">
            K
          </span>
          <span>keep english</span>
        </Link>
        {headerStats}
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.navigation} aria-label={t("navigation.main")}>
        {navigationItems.map(({ href, label, icon }) => {
          const active = pathname !== null && isActiveRoute(pathname, href);

          return (
            <Link
              key={href}
              className={styles.navigationLink}
              href={href}
              aria-current={active ? "page" : undefined}
            >
              <span aria-hidden="true" className={styles.navigationIcon}>
                {icon}
              </span>
              <span className={styles.visuallyHidden}>{t(label)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
