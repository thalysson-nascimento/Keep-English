"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./app-shell.module.css";

interface AppShellProps {
  children: ReactNode;
  headerStats: ReactNode;
}

const navigationItems = [
  { href: "/", label: "Início", icon: "🏠" },
  { href: "/palavras", label: "Palavras", icon: "📚" },
  { href: "/testes", label: "Testes", icon: "🎯" },
  { href: "/ranking", label: "Ranking", icon: "🏆" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
] as const;

function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, headerStats }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Keep English — início"
        >
          <span className={styles.brandMark} aria-hidden="true">
            K
          </span>
          <span>keep english</span>
        </Link>
        {headerStats}
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.navigation} aria-label="Navegação principal">
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
              <span className={styles.visuallyHidden}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
