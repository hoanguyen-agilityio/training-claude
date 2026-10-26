// Libs
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

// Services
import { getVoteExport, parseVoteExport } from '@/services/vote-export';

// Utils
import { pickWinner, tallyVotes } from '@/utils/vote-tally';

// Types
import type { VotingConfig } from '@/types';

const OFFICE_CONFIG: VotingConfig = { closesAt: '11:00', utcOffsetHours: 7 };
const DAY = 'tuesday';
const VALID_VOTE = { user: 'an', meal: 'Bún bò', at: '2026-10-13T09:15:00+07:00' };
// Not the office timezone, so offset-less times can't pass by accident on a UTC+7 machine
const VIEWER_TIME_ZONE = 'Europe/London';
const MONDAY = 'monday';
const MONDAY_DATE = '2026-10-12';
const OFFSETLESS_AT = '2026-10-12T10:30:00';
const OFFSETLESS_VOTE = { user: 'an', meal: 'Phở bò', at: OFFSETLESS_AT };
const OFFSET_VOTE = { user: 'binh', meal: 'Cơm tấm', at: '2026-10-12T09:00:00+07:00' };
// Malformed, date-only, out-of-range, and calendar dates that do not exist (Feb 30, Apr 31)
const UNPARSEABLE_TIMES = [
  'not a time',
  '2026-10-12',
  '2026-13-45T25:00:00',
  '2026-02-30T10:00:00',
  '2026-04-31T10:00:00',
];

beforeAll(() => {
  vi.stubEnv('TZ', VIEWER_TIME_ZONE);
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('getVoteExport', () => {
  test("tallies Tuesday's export without crashing", () => {
    // The null record is gone, leaving five valid votes
    expect(tallyVotes(getVoteExport(DAY), OFFICE_CONFIG)).toEqual({ 'Bún bò': 3, 'Cơm gà': 2 });
  });
});

describe('parseVoteExport', () => {
  test('returns the votes when every record is valid', () => {
    // A clean export passes through unchanged
    expect(parseVoteExport([VALID_VOTE], DAY)).toEqual([VALID_VOTE]);
  });

  test('names the index of a null record', () => {
    // The shape of the original Tuesday bug
    expect(() => parseVoteExport([VALID_VOTE, null], DAY)).toThrow(
      'Invalid vote at index 1 in the tuesday export: null',
    );
  });

  test('rejects a record with a missing field', () => {
    // A vote without a timestamp can't be checked against the cut-off
    const { at: _missing, ...withoutTime } = VALID_VOTE;

    expect(() => parseVoteExport([withoutTime], DAY)).toThrow(
      'Invalid vote at index 0 in the tuesday export',
    );
  });

  test('rejects an export that is not a list', () => {
    // A broken file must not be read as zero votes
    expect(() => parseVoteExport({}, DAY)).toThrow('The tuesday vote export is not a list of votes');
  });

  test('runs in a timezone other than the office one', () => {
    // Guards the tests below: 10:30 local is 09:30Z in London (BST), not 03:30Z as in UTC+7
    expect(new Date(OFFSETLESS_AT).toISOString()).toBe('2026-10-12T09:30:00.000Z');
  });

  test('reads a time without an offset as office time', () => {
    // 10:30 in the export means 10:30 at the office, wherever the dashboard is opened
    expect(parseVoteExport([OFFSETLESS_VOTE], MONDAY, OFFICE_CONFIG)).toEqual([
      { ...OFFSETLESS_VOTE, at: '2026-10-12T10:30:00+07:00' },
    ]);
  });

  test('takes the office offset from the voting config', () => {
    // A half-hour offset west of UTC is written out in full
    const config: VotingConfig = { ...OFFICE_CONFIG, utcOffsetHours: -3.5 };

    expect(parseVoteExport([OFFSETLESS_VOTE], MONDAY, config)[0].at).toBe(
      '2026-10-12T10:30:00-03:30',
    );
  });

  test.each(UNPARSEABLE_TIMES)(
    'names the index of an unparseable time: %s',
    (at) => {
      // A time the cut-off can't be checked against fails here, not in the Votes list
      expect(() => parseVoteExport([VALID_VOTE, { ...VALID_VOTE, at }], DAY)).toThrow(
        `Invalid vote time at index 1 in the tuesday export: "${at}"`,
      );
    },
  );

  test.each([VIEWER_TIME_ZONE, 'America/Los_Angeles'])(
    'tallies an offset-less vote the same in %s as at the office',
    (timeZone) => {
      // Read in the viewer's zone, an's 10:30 vote became 16:30 office time in London (late)
      // and 00:30 the next day in Los Angeles
      vi.stubEnv('TZ', timeZone);

      expect(
        pickWinner(parseVoteExport([OFFSETLESS_VOTE, OFFSET_VOTE], MONDAY), OFFICE_CONFIG, MONDAY_DATE),
      ).toEqual({ meals: ['Cơm tấm', 'Phở bò'], votes: 1 });
    },
  );
});
