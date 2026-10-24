import { describe, expect, it } from 'vitest';

import { nextRelease, remaining } from '../src/lib/release.ts';

describe('nextRelease', () => {
  it('returns this year’s last night of October when still ahead', () => {
    expect(nextRelease(new Date('2026-10-25T12:00:00Z')).toISOString()).toBe(
      '2026-10-31T23:00:00.000Z',
    );
  });

  it('rolls over to next year once the release has passed', () => {
    expect(nextRelease(new Date('2026-10-31T23:00:00Z')).toISOString()).toBe(
      '2027-10-31T23:00:00.000Z',
    );
  });
});

describe('remaining', () => {
  it('splits the time left into units', () => {
    const now = new Date('2026-10-30T21:58:57Z');
    expect(remaining(new Date('2026-10-31T23:00:00Z'), now)).toEqual({ d: 1, h: 1, m: 1, s: 3 });
  });

  it('never goes negative', () => {
    const now = new Date('2027-01-01T00:00:00Z');
    expect(remaining(new Date('2026-10-31T23:00:00Z'), now)).toEqual({ d: 0, h: 0, m: 0, s: 0 });
  });
});
