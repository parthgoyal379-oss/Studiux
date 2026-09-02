import React from 'react';

/**
 * Studiux Vector Logo Mark
 * Tripartite brand philosophy:
 * - Structure (Outer foundation & shield base)
 * - Progress (Ascending purple, slate-blue, and teal bars)
 * - Focus (Right monolithic accent pillar)
 */
export function LogoMark({ size = 28, className = '', style = {}, isDark = false }) {
  const baseFill = isDark ? '#f1f3f9' : 'currentColor';
  return (
    <svg
      width={size}
      height={Math.round(size * (296 / 256))}
      viewBox="0 0 256 296"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`studiux-logo-mark ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Structure: Open foundation block */}
      <path
        d="M 6 126 L 37 126 L 37 178 L 128 234 L 195 198 L 195 238 L 128 284 L 6 210 Z"
        fill={baseFill}
      />
      {/* Focus: Right vertical pillar */}
      <path
        d="M 211 48 L 246 48 L 246 216 L 211 236 Z"
        fill={baseFill}
      />
      {/* Progress: 3 Ascending bars */}
      <polygon points="59,88 88,71 88,162 59,145" fill="#7469B6" />
      <polygon points="109,53 138,36 138,203 109,186" fill="#4B7699" />
      <polygon points="159,18 188,1 188,242 159,225" fill="#34A39C" />
    </svg>
  );
}

/**
 * Complete Studiux Brand Lockup
 */
export function BrandLogo({
  size = 'md',
  markSize,
  layout = 'horizontal',
  showTagline = false,
  className = '',
  onClick,
}) {
  const sizeMap = {
    xs: { mark: 20, font: '14px', gap: '8px', letterSpacing: '0.12em' },
    sm: { mark: 24, font: '16px', gap: '9px', letterSpacing: '0.14em' },
    md: { mark: 28, font: '18px', gap: '11px', letterSpacing: '0.16em' },
    lg: { mark: 40, font: '24px', gap: '14px', letterSpacing: '0.18em' },
    xl: { mark: 56, font: '32px', gap: '18px', letterSpacing: '0.20em' },
  };

  const config = sizeMap[size] || sizeMap.md;
  const actualMarkSize = markSize || config.mark;
  const isVertical = layout === 'vertical';

  return (
    <div
      className={`studiux-brand ${isVertical ? 'studiux-brand-vertical' : ''} ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        gap: isVertical ? '12px' : config.gap,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <LogoMark size={actualMarkSize} />
      <div
        className="studiux-brand-text"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isVertical ? 'center' : 'flex-start',
          lineHeight: 1.1,
        }}
      >
        <span
          className="studiux-brand-title"
          style={{
            fontFamily: 'var(--font-display, "Plus Jakarta Sans", system-ui, sans-serif)',
            fontWeight: 800,
            fontSize: config.font,
            letterSpacing: config.letterSpacing,
            textTransform: 'uppercase',
            color: 'var(--text, #161922)',
          }}
        >
          STUDIUX
        </span>
        {showTagline && (
          <span
            className="studiux-brand-tagline"
            style={{
              fontFamily: 'var(--font-sans, "Manrope", system-ui, sans-serif)',
              fontWeight: 700,
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: 'var(--text-secondary, #6b7280)',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            FOCUS • PLAN • EXECUTE • MASTER
          </span>
        )}
      </div>
    </div>
  );
}
