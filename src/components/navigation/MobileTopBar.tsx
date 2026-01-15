import { Logo } from './Logo';

interface MobileTopBarProps {
  rightSlot?: React.ReactNode;
}

/**
 * Mobile top bar with logo and optional right-side content (date selector).
 * Visible only on mobile devices (< 768px).
 */
export function MobileTopBar({ rightSlot }: MobileTopBarProps) {
  return (
    <header 
      className="md:hidden sticky top-0 z-40 bg-background border-b shadow-sm"
      role="banner"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Logo />
          
          {/* Right side: Date selector or other content */}
          {rightSlot && (
            <div className="flex items-center">
              {rightSlot}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
