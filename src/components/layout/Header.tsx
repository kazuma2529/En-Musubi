"use client";

import Link from "next/link";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  right?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  backHref = "/home",
  right,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center min-w-0 flex-1">
          {showBack ? (
            <Link
              href={backHref}
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-[var(--primary-light)] transition-colors"
              aria-label="戻る"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <div className="w-10" />
          )}
          <h1 className="flex-1 text-center text-lg font-semibold text-[var(--text-primary)] truncate -ml-10 mr-10">
            {title}
          </h1>
        </div>
        {right && <div className="flex items-center">{right}</div>}
      </div>
    </header>
  );
}
