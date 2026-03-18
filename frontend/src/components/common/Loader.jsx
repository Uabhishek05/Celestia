export default function Loader({ cards = 3, compact = false }) {
  return (
    <div className="container-shell animate-pulse py-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-8 w-40 rounded-full bg-white/70 dark:bg-white/10" />
        <div className={compact ? "grid gap-4 sm:grid-cols-2" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>
          {Array.from({ length: cards }).map((_, index) => (
            <div key={index} className={`glass-panel ${compact ? "h-40" : "h-72"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
