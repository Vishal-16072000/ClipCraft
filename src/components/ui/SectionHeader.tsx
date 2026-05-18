interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-3xl ${alignClass}`}>
      <span className="inline-flex items-center gap-2 text-brand-400 font-semibold text-xs uppercase tracking-[0.2em]">
        <span className="h-px w-6 bg-brand-500/60" />
        {label}
        {align === "center" && <span className="h-px w-6 bg-brand-500/60" />}
      </span>
      <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white tracking-tight leading-[1.15]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-gray-400 text-lg leading-relaxed">{description}</p>
      )}
    </div>
  );
}
