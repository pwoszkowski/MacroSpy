import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

interface MobileTopBarProps {
  rightSlot?: React.ReactNode;
  user?: {
    id: string;
    email: string;
  } | null;
}

/**
 * Mobile top bar with logo and optional right-side content (date selector).
 * Visible only on mobile devices (< 768px).
 */
export function MobileTopBar({ rightSlot, user }: MobileTopBarProps) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-background border-b shadow-sm" role="banner">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Logo />

          {/* Right side: Date selector or other content + User Menu */}
          <div className="flex items-center gap-2">
            {rightSlot}
            {user && <UserMenu user={user} />}
          </div>
        </div>
      </div>
    </header>
  );
}
