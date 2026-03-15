import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should filter out falsy values', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar');
  });

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should handle mixed types', () => {
    expect(cn('foo', ['bar'], { baz: true }, null)).toBe('foo bar baz');
  });

  it('should merge tailwind classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});
