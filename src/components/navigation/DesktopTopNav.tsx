import { Home, History, Scale, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/history',
    label: 'Historia',
    icon: History,
  },
  {
    href: '/measurements',
    label: 'Pomiary',
    icon: Scale,
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: User,
  },
];

interface DesktopTopNavProps {
  currentPath: string;
  onAddMealClick?: () => void;
  rightSlot?: React.ReactNode;
}

/**
 * Desktop top navigation bar.
 * Contains logo, navigation links, and optional right-side content (date selector + add meal button).
 * Visible only on desktop devices (>= 768px).
 */
export function DesktopTopNav({ currentPath, onAddMealClick, rightSlot }: DesktopTopNavProps) {
  return (
    <nav 
      className="hidden md:block bg-background border-b shadow-sm sticky top-0 z-40"
      role="navigation"
      aria-label="Główna nawigacja"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
          
          {/* Right side: Date selector + Add Meal button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {rightSlot}
            {onAddMealClick && (
              <Button 
                onClick={onAddMealClick}
                className="gap-2"
                aria-label="Dodaj posiłek"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj posiłek</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
