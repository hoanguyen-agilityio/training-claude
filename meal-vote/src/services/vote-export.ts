// Data
import mondayExport from '@/data/votes-monday.json';
import tuesdayExport from '@/data/votes-tuesday.json';
import wednesdayExport from '@/data/votes-wednesday.json';

// Types
import type { Vote, VoteDay } from '@/types';

const EXPORTS: Record<VoteDay, unknown> = {
  monday: mondayExport,
  tuesday: tuesdayExport,
  wednesday: wednesdayExport,
};

/**
 * Returns one day's vote export as produced by the voting system.
 * The export is an external boundary: its records are trusted as-is, like the real feed.
 */
export const getVoteExport = (day: VoteDay): Vote[] => EXPORTS[day] as Vote[];
