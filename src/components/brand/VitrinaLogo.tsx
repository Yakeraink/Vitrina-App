import React from 'react';

interface VitrinaLogoProps {
  variant?: 'full' | 'mark-only' | 'wordmark';
  theme?: 'color' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function VitrinaLogo({
  variant = 'full',
  theme = 'color',
  size = 'md',
  className = '',
}: VitrinaLogoProps) {
  const dimensions = {
    sm: { icon: 24, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 34, text: 'text-2xl', sub: 'text-[11px]' },
    lg: { icon: 46, text: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 60, text: 'text-5xl', sub: 'text-sm' },
  }[size];

  const primaryFill =
    theme === 'light'
      ? '#FFFFFF'
      : theme === 'dark'
        ? '#18193F'
        : '#3F44CD';

  const textColor =
    theme === 'light'
      ? 'text-white'
      : theme === 'dark'
        ? 'text-[#18193F]'
        : 'text-white';

  const subtextColor =
    theme === 'light'
      ? 'text-white/70'
      : theme === 'dark'
        ? 'text-[#18193F]/70'
        : 'text-[#6D727A]';

  // SVG representation of the Vitrina Awning Brandmark
  const IconMark = (
    <svg
      width={dimensions.icon}
      height={(dimensions.icon * 36) / 48}
      viewBox="0 0 48 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      {/* Upper Awning Bar */}
      <path
        d="M6 8C6 4.68629 8.68629 2 12 2H36C39.3137 2 42 4.68629 42 8V12H6V8Z"
        fill={primaryFill}
      />
      {/* 3 Fluted Awning Drapes with Scalloped Arches */}
      {/* Left Drape */}
      <path
        d="M6 12H18V24C18 27.3137 15.3137 30 12 30C8.68629 30 6 27.3137 6 24V12Z"
        fill={primaryFill}
      />
      {/* Center Drape */}
      <path
        d="M18 12H30V26C30 29.3137 27.3137 32 24 32C20.6863 32 18 29.3137 18 26V12Z"
        fill={primaryFill}
      />
      {/* Right Drape */}
      <path
        d="M30 12H42V24C42 27.3137 39.3137 30 36 30C32.6863 30 30 27.3137 30 24V12Z"
        fill={primaryFill}
      />
      {/* Inner Slit Highlights */}
      <rect x="17.25" y="8" width="1.5" height="15" rx="0.75" fill="#090A1A" opacity="0.3" />
      <rect x="29.25" y="8" width="1.5" height="15" rx="0.75" fill="#090A1A" opacity="0.3" />
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{IconMark}</div>;
  }

  const Wordmark = (
    <div className="flex flex-col leading-none">
      <span className={`font-serif tracking-tight font-bold ${dimensions.text} ${textColor}`}>
        Vitrina
      </span>
      <span className={`font-sans tracking-wider uppercase font-medium mt-0.5 ${dimensions.sub} ${subtextColor}`}>
        by BrayLabs
      </span>
    </div>
  );

  if (variant === 'wordmark') {
    return <div className={`inline-flex items-center ${className}`}>{Wordmark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {IconMark}
      {Wordmark}
    </div>
  );
}
