/** Releases happen on the last night of October, 23:00 UTC. */
const RELEASE_MONTH = 9;
const RELEASE_DAY = 31;
const RELEASE_HOUR_UTC = 23;

/** Next release strictly after `now`. */
export function nextRelease(now: Date): Date {
  const at = (year: number): Date =>
    new Date(Date.UTC(year, RELEASE_MONTH, RELEASE_DAY, RELEASE_HOUR_UTC));
  const thisYear = at(now.getUTCFullYear());
  return thisYear.getTime() > now.getTime() ? thisYear : at(now.getUTCFullYear() + 1);
}

export interface Remaining {
  readonly d: number;
  readonly h: number;
  readonly m: number;
  readonly s: number;
}

/** Splits the time left until `target` into whole days, hours, minutes and seconds. */
export function remaining(target: Date, now: Date): Remaining {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return {
    d: Math.floor(total / 86_400),
    h: Math.floor((total % 86_400) / 3_600),
    m: Math.floor((total % 3_600) / 60),
    s: total % 60,
  };
}
