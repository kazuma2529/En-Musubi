"use client";

import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface PageLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  alertCount?: number;
}

export function PageLayout({
  children,
  showBottomNav = true,
  alertCount = 0,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {children}
      {showBottomNav && <BottomNav alertCount={alertCount} />}
      {/* Spacer for fixed bottom nav */}
      {showBottomNav && (
        <div
          className="h-20"
          style={{
            paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          }}
        />
      )}
    </div>
  );
}
