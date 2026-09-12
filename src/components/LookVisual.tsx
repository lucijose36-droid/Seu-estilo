"use client";

export default function LookVisual({
  paleta,
  compact = false,
}: {
  paleta: string[];
  compact?: boolean;
}) {
  const [a, b, c, d] = paleta;
  const uid = `${a}-${b}`.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: compact ? "4/5" : "3/4", background: c }}
    >
      <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c} />
            <stop offset="100%" stopColor={b} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <rect width="300" height="400" fill={`url(#grad-${uid})`} />
        {/* silhueta abstrata representando o look, sem simular uma foto real */}
        <ellipse cx="150" cy="120" rx="46" ry="52" fill={a} opacity="0.9" />
        <path
          d="M70 400 C70 260 105 200 150 195 C195 200 230 260 230 400 Z"
          fill={a}
        />
        <path
          d="M108 220 C120 260 180 260 192 220 L205 400 L95 400 Z"
          fill={d}
          opacity="0.85"
        />
        <rect x="90" y="230" width="120" height="8" fill={b} opacity="0.7" />
        <circle cx="150" cy="118" r="4" fill={c} opacity="0.6" />
      </svg>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 55%, ${a}cc 100%)`,
        }}
      />
    </div>
  );
}
