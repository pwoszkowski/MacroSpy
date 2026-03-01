/**
 * Logo component for MacroSpy application.
 * Used in both mobile and desktop navigation.
 */
export function Logo() {
  return (
    <a
      href="/"
      className="flex items-center space-x-2 text-xl md:text-2xl font-bold text-foreground hover:opacity-80 transition-opacity"
    >
      <img src="/favicon.svg" alt="Logo MacroSpy" className="w-8 h-8 invert dark:invert-0" />
      <span>MacroSpy</span>
    </a>
  );
}
