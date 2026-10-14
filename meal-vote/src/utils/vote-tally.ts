// Config
import votingConfig from '@/config/voting.json';

// Types
import type { Vote, VoteTally, VotingConfig, Winner } from '@/types';

const MINUTES_IN_DAY = 24 * 60;

/** Collapses runs of whitespace and trims, so "Phở  bò " reads as "Phở bò". */
const tidyMealName = (meal: string): string =>
  meal.normalize('NFC').replace(/\s+/g, ' ').trim();

/** Voters type meal names freely; case and spacing must not split one meal into several. */
const toMealKey = (meal: string): string => tidyMealName(meal).toLocaleLowerCase('vi');

/** A vote counts only if it was cast before the daily cut-off, in office local time. */
export const isOnTime = (
  vote: Vote,
  { closesAt, utcOffsetHours }: VotingConfig = votingConfig,
): boolean => {
  const at = new Date(vote.at);
  const local =
    ((at.getUTCHours() + utcOffsetHours) * 60 + at.getUTCMinutes()) %
    MINUTES_IN_DAY;
  const [hours, minutes] = closesAt.split(':').map(Number);

  return (local + MINUTES_IN_DAY) % MINUTES_IN_DAY <= hours * 60 + minutes;
};

export const tallyVotes = (
  votes: Vote[],
  config: VotingConfig = votingConfig,
): VoteTally => {
  const counts: VoteTally = {};
  // The first spelling seen for a meal is the one shown in the results
  const labels = new Map<string, string>();

  for (const vote of votes) {
    if (!isOnTime(vote, config)) continue;
    const key = toMealKey(vote.meal);
    const label = labels.get(key) ?? tidyMealName(vote.meal);
    labels.set(key, label);
    counts[label] = (counts[label] ?? 0) + 1;
  }

  return counts;
};

export const pickWinner = (
  votes: Vote[],
  config: VotingConfig = votingConfig,
): Winner => {
  const counts = tallyVotes(votes, config);
  let winner: string | null = null;
  let best = 0;

  for (const [meal, count] of Object.entries(counts)) {
    if (count >= best) {
      winner = meal;
      best = count;
    }
  }

  return { meal: winner, votes: best };
};
