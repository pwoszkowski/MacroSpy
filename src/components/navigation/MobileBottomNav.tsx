import { Home, History, Scale, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: Home,
    ariaLabel: "Strona główna - Dashboard",
  },
  {
    href: "/history",
    label: "Historia",
    icon: History,
    ariaLabel: "Historia posiłków",
  },
  {
    href: "/favorites",
    label: "Ulubione",
    icon: Star,
    ariaLabel: "Ulubione posiłki",
  },
  {
    href: "/measurements",
    label: "Pomiary",
    icon: Scale,
    ariaLabel: "Pomiary ciała",
  },
];

interface MobileBottomNavProps {
  currentPath: string;
}

/**
 * Mobile bottom navigation bar.
 * Displays navigation icons with empty space in the center for FAB.
 * Visible only on mobile devices (< 768px).
 */
export function MobileBottomNav({ currentPath }: MobileBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-lg"
      role="navigation"
      aria-label="Główna nawigacja mobilna"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        })}

        {/* Empty space for FAB */}
        <div className="flex-1 h-full" aria-hidden="true" />

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
