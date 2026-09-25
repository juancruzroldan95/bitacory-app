import { useId } from "react";

interface BitacoryLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  fromColor?: string;
  toColor?: string;
}

/**
 * Official Bitacory SVG Logo.
 * Represents an open journal where reflection and dialogue meet:
 * the left page is solid soothing teal, the right page is an open outline.
 *
 * Gradient stops are aligned with the app's Calming Healing Teal palette (OKLCH hue ~223).
 */
export const BitacoryLogo = ({
  className = "h-8 w-8",
  fromColor = "var(--logo-teal-from, #2da7cc)",
  toColor = "var(--logo-teal-to, #005771)",
  ...props
}: BitacoryLogoProps) => {
  const uniqueId = useId();
  const gradId = `bitacory-grad-${uniqueId.replace(/:/g, "")}`;
  const leftClipId = `bitacory-left-${uniqueId.replace(/:/g, "")}`;
  const rightClipId = `bitacory-right-${uniqueId.replace(/:/g, "")}`;

  return (
    <svg
      viewBox="5 5 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={gradId} x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
        <clipPath id={leftClipId}>
          <rect x="0" y="0" width="50.1" height="100" />
        </clipPath>
        <clipPath id={rightClipId}>
          <rect x="49.9" y="0" width="50.1" height="100" />
        </clipPath>
      </defs>

      {/* Left Page (Solid, clipped at center spine) */}
      <g clipPath={`url(#${leftClipId})`}>
        <path
          d="M 50 26 C 35 16, 20 16, 15 16 A 4 4 0 0 0 11 20 L 11 71 A 4 4 0 0 0 15 75 C 20 75, 35 75, 50 85 Z"
          fill={`url(#${gradId})`}
          stroke={`url(#${gradId})`}
          strokeWidth="12"
          strokeLinejoin="round"
        />
      </g>

      {/* Right Page (Open outline without center spine, clipped at center) */}
      <g clipPath={`url(#${rightClipId})`}>
        <path
          d="M 50 26 C 65 16, 80 16, 85 16 A 4 4 0 0 1 89 20 L 89 71 A 4 4 0 0 1 85 75 C 80 75, 65 75, 50 85"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="12"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
