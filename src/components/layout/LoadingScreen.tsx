"use client";

import { PageLayout } from "./PageLayout";

export function LoadingScreen() {
  return (
    <PageLayout showBottomNav={false}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--text-secondary)]">
          読み込み中...
        </div>
      </div>
    </PageLayout>
  );
}
