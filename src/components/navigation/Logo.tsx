/**
 * Logo component for MacroSpy application.
 * Used in both mobile and desktop navigation.
 */
export function Logo() {
  return (
    <a href="/" className="flex items-center space-x-2 text-xl md:text-2xl font-bold text-foreground hover:opacity-80 transition-opacity">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-lg">M</span>
      </div>
      <span>MacroSpy</span>
    </a>
  );
}
