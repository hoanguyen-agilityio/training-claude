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

/** "An", "an" and " an " are one voter: usernames ignore case and surrounding spaces. */
const toUserKey = (user: string): string => user.normalize('NFC').trim().toLocaleLowerCase('vi');

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

/**
 * Each user has one vote per day: their latest on-time one. Usernames that differ only in
 * case or surrounding spaces are the same user. Earlier votes and votes after
 * the cut-off do not count, and neither do votes with a blank meal name, so a blank vote never
 * replaces a real one. Returns the counted votes in export order.
 */
export const selectCountedVotes = (
  votes: Vote[],
  config: VotingConfig = votingConfig,
): Vote[] => {
  const latestByUser = new Map<string, Vote>();

  for (const vote of votes) {
    if (!isOnTime(vote, config)) continue;
    if (!tidyMealName(vote.meal)) continue;
    const key = toUserKey(vote.user);
    const current = latestByUser.get(key);
    if (!current || Date.parse(vote.at) >= Date.parse(current.at)) {
      latestByUser.set(key, vote);
    }
  }

  return votes.filter((vote) => latestByUser.get(toUserKey(vote.user)) === vote);
};

export const tallyVotes = (
  votes: Vote[],
  config: VotingConfig = votingConfig,
): VoteTally => {
  const counts: VoteTally = {};
  // The first spelling seen for a meal is the one shown in the results
  const labels = new Map<string, string>();

  for (const vote of selectCountedVotes(votes, config)) {
    const key = toMealKey(vote.meal);
    const label = labels.get(key) ?? tidyMealName(vote.meal);
    labels.set(key, label);
    counts[label] = (counts[label] ?? 0) + 1;
  }

  return counts;
};

/** A tie names every tied meal, in alphabetical order so the export's row order has no say. */
export const pickWinner = (
  votes: Vote[],
  config: VotingConfig = votingConfig,
): Winner => {
  const counts = Object.entries(tallyVotes(votes, config));
  const best = Math.max(0, ...counts.map(([, count]) => count));
  const meals = counts
    .filter(([, count]) => count === best)
    .map(([meal]) => meal)
    .sort((a, b) => a.localeCompare(b, 'vi'));

  return { meals, votes: best };
};
