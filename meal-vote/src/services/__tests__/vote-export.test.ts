// Libs
import { describe, expect, test } from 'vitest';

// Services
import { getVoteExport, parseVoteExport } from '@/services/vote-export';

// Utils
import { tallyVotes } from '@/utils/vote-tally';

// Types
import type { VotingConfig } from '@/types';

const OFFICE_CONFIG: VotingConfig = { closesAt: '11:00', utcOffsetHours: 7 };
const DAY = 'tuesday';
const VALID_VOTE = { user: 'an', meal: 'Bún bò', at: '2026-10-13T09:15:00+07:00' };

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
});
