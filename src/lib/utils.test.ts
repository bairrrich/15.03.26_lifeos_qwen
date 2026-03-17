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

  it('should handle empty strings', () => {
    expect(cn('', 'foo', '')).toBe('foo');
  });

  it('should handle all falsy values', () => {
    expect(cn(null, undefined, false, '', 0)).toBe('');
  });

  it('should preserve non-conflicting classes', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center');
  });

  it('should handle nested arrays', () => {
    expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz');
  });

  it('should handle nested objects (flattened)', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should filter out numbers in class position', () => {
    expect(cn('foo', 0, 'bar')).toBe('foo bar');
  });

  it('should handle strings with spaces', () => {
    expect(cn('foo bar', 'baz qux')).toBe('foo bar baz qux');
  });

  it('should handle conditional classes', () => {
    const condition = true;
    expect(cn('base', condition && 'active')).toBe('base active');
  });

  it('should handle false conditional', () => {
    const condition = false;
    expect(cn('base', condition && 'active')).toBe('base');
  });
});
