/**
 * Ilustraciones vectoriales con el estilo del logo de Curiosiika:
 * trazo azul noche, rellenos planos en rosa, turquesa, lila y kraft.
 */
type P = React.SVGProps<SVGSVGElement>;
const INK = "#1c1b3a";

export function Bulb(props: P) {
  return (
    <svg viewBox="0 0 120 150" fill="none" aria-hidden="true" {...props}>
      <g stroke={INK} strokeWidth="3.2" strokeLinecap="round">
        <path d="M60 6v12M22 22l8 8M98 22l-8 8M8 60h12M100 60h12" />
      </g>
      <path
        d="M60 30c-19 0-33 14-33 32 0 12 6 20 12 26 4 4 6 9 6 14v6h30v-6c0-5 2-10 6-14 6-6 12-14 12-26 0-18-14-32-33-32Z"
        fill="#fff" stroke={INK} strokeWidth="3.2" strokeLinejoin="round"
      />
      <path d="M44 52c2-6 7-10 13-11" stroke="#d9d6ea" strokeWidth="4" strokeLinecap="round" />
      <path
        className="origin-[60px_66px] animate-pulse-heart"
        d="M60 78s-14-8-14-17c0-5 4-8 8-8 3 0 5 2 6 4 1-2 3-4 6-4 4 0 8 3 8 8 0 9-14 17-14 17Z"
        fill="#ec4f8f" stroke={INK} strokeWidth="2.4" strokeLinejoin="round"
      />
      <path d="M60 78v30" stroke={INK} strokeWidth="2.4" />
      <rect x="43" y="108" width="34" height="9" rx="4.5" fill="#17a8a0" stroke={INK} strokeWidth="3" />
      <rect x="45" y="117" width="30" height="9" rx="4.5" fill="#17a8a0" stroke={INK} strokeWidth="3" />
      <rect x="47" y="126" width="26" height="9" rx="4.5" fill="#17a8a0" stroke={INK} strokeWidth="3" />
      <path d="M53 135c0 5 14 5 14 0" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function GiftBox(props: P) {
  return (
    <svg viewBox="0 0 140 130" fill="none" aria-hidden="true" {...props}>
      <path d="M18 52h104v66a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V52Z" fill="#c9976a" stroke={INK} strokeWidth="3" />
      <path d="M12 38h116v18H12z" fill="#d8a77a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M62 38h16v86H62z" fill="#ec4f8f" stroke={INK} strokeWidth="3" />
      <path
        d="M70 38c-6-14-26-24-32-14-5 9 12 14 32 14Zm0 0c6-14 26-24 32-14 5 9-12 14-32 14Z"
        fill="#ec4f8f" stroke={INK} strokeWidth="3" strokeLinejoin="round"
      />
      <path d="M70 38c-4 8-10 14-16 18M70 38c4 8 10 14 16 18" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M92 84l10 8" stroke={INK} strokeWidth="2" strokeDasharray="3 3" />
      <path
        d="M106 96s-9-5-9-11c0-3 2.5-5 5-5 2 0 3.3 1.2 4 2.5.7-1.3 2-2.5 4-2.5 2.5 0 5 2 5 5 0 6-9 11-9 11Z"
        fill="#17a8a0" stroke={INK} strokeWidth="2.4" strokeLinejoin="round"
      />
      <path d="M26 66h28M26 74h20" stroke="#a87a50" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 5" />
    </svg>
  );
}

export function Jar(props: P) {
  return (
    <svg viewBox="0 0 110 150" fill="none" aria-hidden="true" {...props}>
      <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round">
        <rect x="30" y="4" width="11" height="62" rx="2" fill="#ec4f8f" transform="rotate(-10 35 35)" />
        <rect x="46" y="0" width="11" height="64" rx="2" fill="#f6c744" />
        <rect x="62" y="4" width="11" height="62" rx="2" fill="#17a8a0" transform="rotate(8 67 35)" />
        <rect x="74" y="12" width="10" height="56" rx="2" fill="#b49be3" transform="rotate(16 79 40)" />
      </g>
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".85">
        <path d="M51 10l3 6M51 22l3 6M51 34l3 6" />
        <path d="M65 16l4 4M64 28l4 4" />
      </g>
      <rect x="20" y="52" width="70" height="14" rx="5" fill="#d2f1ee" stroke={INK} strokeWidth="3" />
      <path
        d="M24 66h62c4 0 6 4 6 8v56c0 8-6 14-14 14H32c-8 0-14-6-14-14V74c0-4 2-8 6-8Z"
        fill="#5fc6bf" fillOpacity=".85" stroke={INK} strokeWidth="3"
      />
      <path d="M28 78v46" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".6" />
      <path
        d="M55 116s-13-7-13-15c0-4 3-7 7-7 3 0 5 2 6 4 1-2 3-4 6-4 4 0 7 3 7 7 0 8-13 15-13 15Z"
        fill="#ec4f8f" stroke={INK} strokeWidth="2.4" strokeLinejoin="round"
      />
    </svg>
  );
}

export function Scissors(props: P) {
  return (
    <svg viewBox="0 0 120 140" fill="none" aria-hidden="true" {...props}>
      <path d="M58 70 20 6c-2-3 1-6 4-4l44 60" fill="#cfd3dc" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M62 70 100 6c2-3-1-6-4-4L52 62" fill="#e6e8ee" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="60" cy="66" r="4" fill={INK} />
      <path d="M54 76c-6 6-14 8-20 10" stroke={INK} strokeWidth="3" />
      <ellipse cx="30" cy="104" rx="20" ry="24" fill="#17a8a0" stroke={INK} strokeWidth="3" transform="rotate(20 30 104)" />
      <ellipse cx="30" cy="104" rx="9" ry="12" fill="#fff9f1" stroke={INK} strokeWidth="3" transform="rotate(20 30 104)" />
      <path d="M66 76c6 6 14 8 20 10" stroke={INK} strokeWidth="3" />
      <ellipse cx="90" cy="104" rx="20" ry="24" fill="#17a8a0" stroke={INK} strokeWidth="3" transform="rotate(-20 90 104)" />
      <ellipse cx="90" cy="104" rx="9" ry="12" fill="#fff9f1" stroke={INK} strokeWidth="3" transform="rotate(-20 90 104)" />
    </svg>
  );
}

export function Yarn(props: P) {
  return (
    <svg viewBox="0 0 120 100" fill="none" aria-hidden="true" {...props}>
      <circle cx="50" cy="50" r="34" fill="#c9976a" stroke={INK} strokeWidth="3" />
      <g stroke="#8d6440" strokeWidth="2.2" strokeLinecap="round">
        <path d="M22 36c16 8 40 6 58-6M18 52c20 8 46 6 64-8M24 68c18 6 40 2 54-12" />
        <path d="M40 18c-6 18-4 44 8 64M58 17c-8 20-6 42 6 62" />
      </g>
      <path d="M78 70c10 6 16 14 30 10 8-2 6 10-2 10" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Heart({ color = "#ec4f8f", ...props }: P & { color?: string }) {
  return (
    <svg viewBox="0 0 40 36" aria-hidden="true" {...props}>
      <path
        d="M20 34S2 23.5 2 11.5C2 6 6 2 11 2c4 0 7 2.5 9 6 2-3.5 5-6 9-6 5 0 9 4 9 9.5C38 23.5 20 34 20 34Z"
        fill={color}
      />
      <path d="M9 9c1-2 3-3 5-3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".55" fill="none" />
    </svg>
  );
}

export function Star({ color = INK, ...props }: P & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2Z" fill={color} />
    </svg>
  );
}

export function Sparkle({ color = "#f6c744", ...props }: P & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 0c.8 6.4 4.6 10.6 12 12-7.4 1.4-11.2 5.6-12 12-.8-6.4-4.6-10.6-12-12C7.4 10.6 11.2 6.4 12 0Z" fill={color} />
    </svg>
  );
}

export function Squiggle(props: P) {
  return (
    <svg viewBox="0 0 60 30" fill="none" aria-hidden="true" {...props}>
      <path d="M4 22c6-14 14-14 16-6s-6 10-6 4 10-16 18-12 4 14 10 8 8-10 14-8" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Subrayado a mano para títulos */
export function Underline({ color = "#ec4f8f", ...props }: P & { color?: string }) {
  return (
    <svg viewBox="0 0 300 20" preserveAspectRatio="none" fill="none" aria-hidden="true" {...props}>
      <path d="M3 14c60-8 140-12 294-6" stroke={color} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
