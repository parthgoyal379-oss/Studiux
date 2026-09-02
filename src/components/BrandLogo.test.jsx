import React from 'react';
import { describe, it, expect } from 'vitest';
import { LogoMark, BrandLogo } from './BrandLogo.jsx';

describe('BrandLogo component suite', () => {
  it('renders LogoMark with valid SVG properties', () => {
    const el = LogoMark({ size: 32 });
    expect(el).toBeDefined();
    expect(el.type).toBe('svg');
    expect(el.props.width).toBe(32);
    expect(el.props['aria-hidden']).toBe('true');
  });

  it('renders BrandLogo with default horizontal lockup', () => {
    const el = BrandLogo({ size: 'md' });
    expect(el).toBeDefined();
    expect(el.props.className).toContain('studiux-brand');
    expect(el.props.style.flexDirection).toBe('row');
  });

  it('renders BrandLogo with vertical layout and tagline when requested', () => {
    const el = BrandLogo({ size: 'lg', layout: 'vertical', showTagline: true });
    expect(el).toBeDefined();
    expect(el.props.className).toContain('studiux-brand-vertical');
    expect(el.props.style.flexDirection).toBe('column');
  });
});
