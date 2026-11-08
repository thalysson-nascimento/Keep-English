"use client";

import { BookOpen, House, Target, Trophy, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./app-shell.module.css";

interface AppShellProps {
  children: ReactNode;
}

const navigationItems = [
  { href: "/", label: "Início", Icon: House },
  { href: "/palavras", label: "Palavras", Icon: BookOpen },
  { href: "/testes", label: "Testes", Icon: Target },
  { href: "/ranking", label: "Ranking", Icon: Trophy },
  { href: "/perfil", label: "Perfil", Icon: UserRound },
] as const;

function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: AppShellProps) {
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
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.navigation} aria-label="Navegação principal">
        {navigationItems.map(({ href, label, Icon }) => {
          const active = pathname !== null && isActiveRoute(pathname, href);

          return (
            <Link
              key={href}
              className={styles.navigationLink}
              href={href}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={styles.navigationIcon} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
