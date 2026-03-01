"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: "/home", label: "ホーム", icon: "🏠" },
  { href: "/alerts", label: "アラート", icon: "🔔" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

interface BottomNavProps {
  alertCount?: number;
}

export function BottomNav({ alertCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  const items = navItems.map((item) =>
    item.href === "/alerts" ? { ...item, badge: alertCount } : item
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-[var(--card)] border-t border-[var(--border)]"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 py-2
                transition-colors duration-200
                ${isActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}
              `}
            >
              <span className="relative text-2xl">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center
                      bg-[var(--danger)] text-white text-xs font-bold rounded-full"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </span>
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
