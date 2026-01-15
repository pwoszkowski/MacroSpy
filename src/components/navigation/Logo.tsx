/**
 * Logo component for MacroSpy application.
 * Used in both mobile and desktop navigation.
 */
export function Logo() {
  return (
    <a href="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:opacity-80 transition-opacity">
      <span className="text-2xl">🎯</span>
      <span>MacroSpy</span>
    </a>
  );
}
