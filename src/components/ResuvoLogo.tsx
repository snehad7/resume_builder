import React from 'react';

interface ResuvoLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export const ResuvoLogo: React.FC<ResuvoLogoProps> = ({
  size = 36,
  className = '',
  showWordmark = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Distinctive Resuvo Lettermark R with Document & Opportunity Teal Accent */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        aria-label="Resuvo Logo"
      >
        <defs>
          {/* Deep Navy-Blue Corporate Gradient */}
          <linearGradient id="resuvo-navy-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="60%" stopColor="#1C2541" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Opportunity Teal Accent Gradient */}
          <linearGradient id="resuvo-teal-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Soft inner glow / document contour */}
          <linearGradient id="resuvo-subtle-glow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Squircle Badge Background */}
        <rect
          x="0.5"
          y="0.5"
          width="35"
          height="35"
          rx="8.5"
          fill="url(#resuvo-navy-bg)"
          stroke="#1E293B"
          strokeWidth="1"
        />

        {/* Subtle Document Silhouette in background */}
        <path
          d="M9 8h11l5 5v15H9z"
          fill="url(#resuvo-subtle-glow)"
        />

        {/* Left Vertical Spine / Document Edge (White) */}
        <rect
          x="9"
          y="8.5"
          width="4"
          height="19"
          rx="1.5"
          fill="#FFFFFF"
        />

        {/* Upper Loop of the Letter 'R' (White) */}
        <path
          d="M13 8.5h6.5c3.3 0 5.5 2.1 5.5 5.1s-2.2 5.1-5.5 5.1H13v-10.2z"
          fill="#FFFFFF"
        />

        {/* Inner Counter Cutout of the 'R' Loop (Deep Navy) */}
        <path
          d="M13 11.8h5.8c1.5 0 2.4 0.8 2.4 1.8s-0.9 1.8-2.4 1.8H13v-3.6z"
          fill="#1C2541"
        />

        {/* Forward Momentum Leg of 'R' with Opportunity Teal Gradient */}
        <path
          d="M14.5 17.5l6.5 9c0.4 0.6 1.2 0.7 1.8 0.3l1.2-0.8c0.6-0.4 0.7-1.2 0.3-1.8l-6.5-8.8c-0.4-0.6-1.2-0.7-1.8-0.3l-1.2 0.8c-0.6 0.4-0.7 1.2-0.3 1.6z"
          fill="url(#resuvo-teal-accent)"
        />

        {/* Opportunity Accent Node (Verified ATS & Career Readiness Dot) */}
        <circle cx="26" cy="10" r="2.2" fill="url(#resuvo-teal-accent)" />
      </svg>

      {/* Optional Wordmark Display */}
      {showWordmark && (
        <div className="flex flex-col">
          <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
            Resuvo
          </span>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">
            Build a better resume
          </span>
        </div>
      )}
    </div>
  );
};
