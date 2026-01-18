import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "../navigation/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface OnboardingTopBarProps {
  user?: {
    id: string;
    email: string;
  } | null;
}

/**
 * Top bar dla strony onboardingu
 * Zawiera logo po lewej stronie i menu profilu po prawej z opcją wylogowania
 */
export function OnboardingTopBar({ user }: OnboardingTopBarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Przekierowanie do strony logowania po wylogowaniu
        window.location.href = "/login";
      } else {
        const errorData = await response.json();
        toast.error("Błąd wylogowania", {
          description: errorData.error || "Wystąpił błąd podczas wylogowywania.",
        });
      }
    } catch (error) {
      toast.error("Błąd połączenia", {
        description: "Nie udało się nawiązać połączenia z serwerem.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-background border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Menu profilu */}
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" aria-label="Menu użytkownika">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Wylogowywanie..." : "Wyloguj się"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
