export function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute -left-16 -top-16 h-64 w-64 animate-blob rounded-full bg-accent/30 opacity-70 mix-blend-multiply blur-xl filter"
      />
      <div
        className="absolute -bottom-16 -right-16 h-72 w-72 animate-blob rounded-full bg-purple-400/30 opacity-70 mix-blend-multiply blur-xl filter"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute -bottom-8 left-20 h-56 w-56 animate-blob rounded-full bg-pink-400/30 opacity-70 mix-blend-multiply blur-xl filter"
        style={{ animationDelay: '4s' }}
      />
    </div>
  );
}
