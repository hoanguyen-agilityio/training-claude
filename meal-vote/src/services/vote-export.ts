// Data
import mondayExport from '@/data/votes-monday.json';
import tuesdayExport from '@/data/votes-tuesday.json';
import wednesdayExport from '@/data/votes-wednesday.json';
import thursdayExport from '@/data/votes-thursday.json';

// Types
import type { Vote, VoteDay } from '@/types';

const EXPORTS: Record<VoteDay, unknown> = {
  monday: mondayExport,
  tuesday: tuesdayExport,
  wednesday: wednesdayExport,
  thursday: thursdayExport,
};

const VOTE_FIELDS = ['user', 'meal', 'at'] as const;

const isVote = (record: unknown): record is Vote =>
  typeof record === 'object' &&
  record !== null &&
  VOTE_FIELDS.every((field) => typeof Reflect.get(record, field) === 'string');

/**
 * Checks a vote export from the voting system before anything tallies it.
 * The export is an external boundary, so a bad record fails here with its index
 * instead of as a TypeError deep inside the tally.
 */
export const parseVoteExport = (records: unknown, day: VoteDay): Vote[] => {
  if (!Array.isArray(records)) {
    throw new Error(`The ${day} vote export is not a list of votes`);
  }

  const invalidIndex = records.findIndex((record) => !isVote(record));

  if (invalidIndex !== -1) {
    throw new Error(
      `Invalid vote at index ${invalidIndex} in the ${day} export: ` +
        `${JSON.stringify(records[invalidIndex])} (expected ${VOTE_FIELDS.join(', ')})`,
    );
  }

  return records.filter(isVote);
};

/** Returns one day's vote export as produced by the voting system. */
export const getVoteExport = (day: VoteDay): Vote[] => parseVoteExport(EXPORTS[day], day);
