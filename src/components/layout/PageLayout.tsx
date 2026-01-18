import type { ReactNode } from "react";
import { MobileBottomNav, MobileTopBar, DesktopTopNav } from "@/components/navigation";

interface PageLayoutProps {
  /** Current page path for active navigation state */
  currentPath: string;
  /** Main content of the page */
  children: ReactNode;
  /** Optional content for mobile top bar (e.g., full date selector) */
  mobileRightSlot?: ReactNode;
  /** Optional content for desktop nav bar (e.g., compact date selector) */
  desktopRightSlot?: ReactNode;
  /** Optional callback for "Add Meal" button (desktop only) */
  onAddMealClick?: () => void;
  /** Whether to show the add meal button in desktop nav */
  showAddMealButton?: boolean;
  /** User information for authentication state */
  user?: {
    id: string;
    email: string;
  } | null;
}

/**
 * Main page layout component that wraps all pages.
 * Provides consistent navigation across mobile and desktop:
 * - Mobile: Top bar with logo, main content, bottom navigation
 * - Desktop: Top nav with logo and links, main content (centered)
 */
export function PageLayout({
  currentPath,
  children,
  mobileRightSlot,
  desktopRightSlot,
  onAddMealClick,
  showAddMealButton = true,
  user,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Bar */}
      <MobileTopBar rightSlot={mobileRightSlot} user={user} />

      {/* Desktop Top Navigation */}
      <DesktopTopNav
        currentPath={currentPath}
        onAddMealClick={showAddMealButton ? onAddMealClick : undefined}
        rightSlot={desktopRightSlot}
        user={user}
      />

      {/* Main Content */}
      <main className="pb-20 md:pb-6">{children}</main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentPath={currentPath} />
    </div>
  );
}
