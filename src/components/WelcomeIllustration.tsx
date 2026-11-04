import React from 'react';

interface WelcomeIllustrationProps {
  className?: string;
}

/**
 * Modern vector illustration of a professional woman working on a laptop,
 * creating her resume in Resuvo. Styled with Resuvo's brand palette
 * (indigo, teal, slate, and amber).
 */
export const WelcomeIllustration: React.FC<WelcomeIllustrationProps> = ({
  className = 'w-64 h-auto',
}) => {
  return (
    <svg
      viewBox="0 0 340 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-label="Illustration of a professional woman working on a resume with her laptop"
    >
      <defs>
        {/* Soft radial backdrop glow */}
        <radialGradient id="backdrop-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#c7d2fe" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
        </radialGradient>

        {/* Laptop screen gradient */}
        <linearGradient id="screen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        {/* Hair gradient */}
        <linearGradient id="hair-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Shirt/Blazer gradient */}
        <linearGradient id="blazer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        {/* Desk drop shadow */}
        <filter id="desk-shadow" x="-5%" y="0%" width="110%" height="150%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Decorative ambient background circle */}
      <circle cx="170" cy="115" r="95" fill="url(#backdrop-glow)" />

      {/* Subtle floating creative elements / resume sparkles */}
      <g opacity="0.85">
        {/* Sparkle top left */}
        <path
          d="M75 52L78 60L86 63L78 66L75 74L72 66L64 63L72 60L75 52Z"
          fill="#f59e0b"
        />
        {/* Sparkle top right */}
        <path
          d="M265 42L267.5 48.5L274 51L267.5 53.5L265 60L262.5 53.5L256 51L262.5 48.5L265 42Z"
          fill="#6366f1"
        />
        {/* Floating document badge with checkmark */}
        <rect
          x="248"
          y="72"
          width="36"
          height="46"
          rx="5"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          filter="url(#desk-shadow)"
        />
        <line x1="255" y1="82" x2="277" y2="82" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="255" y1="89" x2="273" y2="89" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="255" y1="95" x2="269" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="274" cy="107" r="6" fill="#10b981" />
        <path d="M272 107L273.5 108.5L276.5 105.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Modern desk surface */}
      <rect
        x="30"
        y="180"
        width="280"
        height="6"
        rx="3"
        fill="#cbd5e1"
        filter="url(#desk-shadow)"
      />
      <rect x="42" y="186" width="4" height="34" rx="2" fill="#94a3b8" opacity="0.6" />
      <rect x="294" y="186" width="4" height="34" rx="2" fill="#94a3b8" opacity="0.6" />

      {/* Coffee mug on desk */}
      <rect x="68" y="158" width="16" height="22" rx="3" fill="#0ea5e9" />
      <path d="M84 163C87 163 89 165 89 169C89 173 87 175 84 175" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Steam line */}
      <path d="M74 153C73 150 76 148 74 145" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1 2" fill="none" />

      {/* Chair Backrest */}
      <rect x="110" y="105" width="28" height="75" rx="8" fill="#475569" />
      <rect x="120" y="180" width="8" height="25" rx="2" fill="#334155" />

      {/* Woman Character */}
      {/* Back Hair */}
      <path
        d="M136 78C136 60 148 48 166 48C184 48 196 60 196 78C196 98 192 118 190 126C186 127 180 127 176 126C174 112 173 98 173 98C173 98 162 108 152 106C142 104 136 94 136 78Z"
        fill="url(#hair-grad)"
      />

      {/* Body / Torso / Blazer */}
      <path
        d="M142 124C148 116 156 112 168 112C180 112 188 116 194 124L204 178C204 180 202 182 200 182H136C134 182 132 180 132 178L142 124Z"
        fill="url(#blazer-grad)"
      />

      {/* Inner top / shirt collar */}
      <path d="M161 112L168 126L175 112" fill="#ffffff" />
      <path d="M168 126L168 148" stroke="#e0e7ff" strokeWidth="1.5" />

      {/* Neck */}
      <rect x="163" y="98" width="10" height="16" rx="3" fill="#fbcfe8" />

      {/* Head / Face */}
      <ellipse cx="168" cy="80" rx="14" ry="17" fill="#fbcfe8" />

      {/* Front Hair & Stylish Bangs */}
      <path
        d="M154 75C154 62 161 52 172 52C183 52 188 60 188 68C188 74 184 76 179 74C173 72 168 74 163 79C158 84 154 82 154 75Z"
        fill="url(#hair-grad)"
      />
      {/* Ear & Tiny Earring */}
      <ellipse cx="155" cy="81" rx="2.5" ry="3.5" fill="#fbcfe8" />
      <circle cx="155" cy="84" r="1" fill="#f59e0b" />

      {/* Facial Profile features (focused, pleasant expression) */}
      <path d="M172 78C174 78 175 79 176 80" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M173 86C175 87 177 87 179 86" stroke="#e11d48" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      {/* Cheerful blush */}
      <circle cx="172" cy="84" r="2.5" fill="#f43f5e" opacity="0.3" />

      {/* Arms & Hands Typing on Laptop */}
      {/* Right Arm reaching forward */}
      <path
        d="M186 128C194 135 204 144 214 156C218 160 216 165 210 166C204 167 196 156 188 146"
        fill="#4f46e5"
      />
      {/* Left Arm and hands */}
      <path
        d="M152 132C158 142 168 153 182 162C188 166 195 166 200 165"
        stroke="#4338ca"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="204" cy="164" rx="5" ry="3.5" fill="#fbcfe8" />
      <ellipse cx="212" cy="164" rx="4.5" ry="3.5" fill="#fbcfe8" />

      {/* Laptop & Screen */}
      {/* Laptop Base */}
      <polygon
        points="188,180 248,180 240,166 196,166"
        fill="#e2e8f0"
        stroke="#94a3b8"
        strokeWidth="1"
      />
      {/* Touchpad */}
      <rect x="212" y="174" width="12" height="4" rx="1" fill="#cbd5e1" />

      {/* Laptop Screen Display (facing the user at a stylish angle) */}
      <polygon
        points="196,166 240,166 235,116 191,116"
        fill="url(#screen-grad)"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {/* Screen resume preview details */}
      <rect x="198" y="122" width="31" height="38" rx="2" fill="#ffffff" opacity="0.95" />
      {/* Header bar on resume */}
      <rect x="201" y="125" width="16" height="3.5" rx="1" fill="#4f46e5" />
      <rect x="201" y="130" width="25" height="1.5" rx="0.5" fill="#94a3b8" />
      {/* Body lines on resume */}
      <rect x="201" y="134" width="25" height="1" rx="0.5" fill="#cbd5e1" />
      <rect x="201" y="137" width="22" height="1" rx="0.5" fill="#cbd5e1" />
      <rect x="201" y="140" width="24" height="1" rx="0.5" fill="#cbd5e1" />
      <rect x="201" y="144" width="14" height="2" rx="0.5" fill="#0ea5e9" />
      <rect x="201" y="148" width="23" height="1" rx="0.5" fill="#cbd5e1" />
      <rect x="201" y="151" width="18" height="1" rx="0.5" fill="#cbd5e1" />

      {/* Soft shadow under laptop */}
      <ellipse cx="218" cy="181" rx="30" ry="2" fill="#64748b" opacity="0.25" />
    </svg>
  );
};
