// Libs
import { describe, expect, test } from 'vitest';

// Utils
import { formatOfficeTime } from '@/utils/format-time';

const VOTE_AT_OFFICE = '2026-10-14T11:20:00+07:00';
const SAME_MOMENT_IN_UTC = '2026-10-14T04:20:00Z';
const OFFICE_TIME = '11:20';

describe('formatOfficeTime', () => {
  test('shows the time in office time', () => {
    // A timestamp already in office time is shown as written
    expect(formatOfficeTime(VOTE_AT_OFFICE)).toBe(OFFICE_TIME);
  });

  test('converts timestamps from other offsets to office time', () => {
    // 04:20 UTC is 11:20 in Vietnam
    expect(formatOfficeTime(SAME_MOMENT_IN_UTC)).toBe(OFFICE_TIME);
  });
});
