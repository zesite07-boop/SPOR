export function SectionSeparator({ className = "" }: { className?: string }) {
  return <div className={`padma-section-separator ${className}`.trim()} aria-hidden />;
}
