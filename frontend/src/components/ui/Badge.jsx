import { POLL_TYPE_META, cn } from "../../lib/utils";

export default function Badge({ type, className, children }) {
  const meta = POLL_TYPE_META[type];
  if (children) {
    return (
      <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium", className)}>
        {children}
      </span>
    );
  }
  if (!meta) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold", meta.color, className)}>
      <span>{meta.icon}</span>
      {meta.label}
    </span>
  );
}
