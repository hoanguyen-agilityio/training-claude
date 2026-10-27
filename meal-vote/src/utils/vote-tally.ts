// Config
import votingConfig from '@/config/voting.json';

// Types
import type { Vote, VoteTally, VotingConfig, Winner } from '@/types';

const MS_IN_HOUR = 60 * 60 * 1000;

/** Collapses runs of whitespace and trims, so "Phở  bò " reads as "Phở bò". */
const tidyMealName = (meal: string): string =>
  meal.normalize('NFC').replace(/ +/g, ' ').trim();

/** Voters type meal names freely; case and spacing must not split one meal into several. */
const toMealKey = (meal: string): string => tidyMealName(meal).toLocaleLowerCase('vi');

/** "An", "an" and " an " are one voter: usernames ignore case and surrounding spaces. */
const toUserKey = (user: string): string => user.trim().toLocaleLowerCase('vi');

/** Minutes since midnight in office local time, 0–1439. */
const toOfficeMinutes = (at: Date, utcOffsetHours: number): number => {
  const hours = (at.getUTCHours() + Math.floor(utcOffsetHours) + 24) % 24;

  return hours * 60 + at.getUTCMinutes();
};

/** A vote counts only if it was cast before the daily cut-off, in office local time. */
export const isOnTime = (
  vote: Vote,
  { closesAt, utcOffsetHours }: VotingConfig = votingConfig,
): boolean => {
  const [hours, minutes] = closesAt.split(':').map(Number);

  return toOfficeMinutes(new Date(vote.at), utcOffsetHours) <= hours * 60 + minutes;
};

/** A vote belongs to a day only if it was cast on that date ("YYYY-MM-DD") in office local time. */
export const isOnDate = (
  vote: Vote,
  date: string,
  { utcOffsetHours }: VotingConfig = votingConfig,
): boolean => {
  const officeTime = new Date(Date.parse(vote.at) + utcOffsetHours * MS_IN_HOUR);

  // The "sv" locale formats dates as YYYY-MM-DD
  return officeTime.toLocaleDateString('sv') === date;
};

/**
 * Each user has one vote per day: their latest on-time one. Usernames that differ only in
 * case or surrounding spaces are the same user. Earlier votes and votes after
 * the cut-off do not count, nor, when a date is given, votes cast on another date. Votes with
 * a blank meal name do not count either, so a blank vote never replaces a real one.
 * Returns the counted votes in export order.
 */
export const selectCountedVotes = (
  votes: Vote[],
  config: VotingConfig = votingConfig,
  date?: string,
): Vote[] => {
  const latestByUser = new Map<string, Vote>();

  for (const vote of votes) {
    if (!isOnTime(vote, config)) continue;
    if (date !== undefined && !isOnDate(vote, date, config)) continue;
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
  date?: string,
): VoteTally => {
  const counts: VoteTally = {};
  // The first spelling seen for a meal is the one shown in the results
  const labels = new Map<string, string>();

  for (const vote of selectCountedVotes(votes, config, date)) {
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
  date?: string,
): Winner => {
  const counts = Object.entries(tallyVotes(votes, config, date));
  const best = Math.max(0, ...counts.map(([, count]) => count));
  const meals = counts
    .filter(([, count]) => count === best)
    .map(([meal]) => meal)
    .sort();

  return { meals, votes: best };
};
