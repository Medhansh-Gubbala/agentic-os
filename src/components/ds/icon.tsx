import { icons } from "lucide-react";
import type { CSSProperties } from "react";

function kebabToPascal(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Icon — resolves a kebab-case lucide name (e.g. "layout-dashboard") to a lucide-react component. */
export function Icon({
  name,
  size = 16,
  strokeWidth = 1.75,
  color = "currentColor",
  style,
  className,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const Lucide = icons[kebabToPascal(name) as keyof typeof icons];
  if (!Lucide) {
    // ponytail: unknown icon name, render a 1px placeholder instead of crashing
    return <span className={className} style={{ display: "inline-block", width: 1, height: 1, ...style }} />;
  }
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        color,
        flex: "0 0 auto",
        ...style,
      }}
    >
      <Lucide size={size} strokeWidth={strokeWidth} color={color} />
    </span>
  );
}
