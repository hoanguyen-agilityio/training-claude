// Config
import votingConfig from '@/config/voting.json';

// Types
import { VoteStatus, type Vote, type VoteTally, type VotingConfig, type Winner } from '@/types';

const MINUTES_IN_DAY = 24 * 60;
const MS_IN_HOUR = 60 * 60 * 1000;

/** Collapses runs of whitespace and trims, so "Phở  bò " reads as "Phở bò". */
const tidyMealName = (meal: string): string =>
  meal.normalize('NFC').replace(/\s+/g, ' ').trim();

/** Voters type meal names freely; case and spacing must not split one meal into several. */
const toMealKey = (meal: string): string => tidyMealName(meal).toLocaleLowerCase('vi');

/** "An", "an" and " an " are one voter: usernames ignore case and surrounding spaces. */
const toUserKey = (user: string): string => user.normalize('NFC').trim().toLocaleLowerCase('vi');

// Whitespace plus characters fonts draw as nothing (zero-width space, soft hyphen, BOM, ...)
const INVISIBLE = /[\p{White_Space}\p{Default_Ignorable_Code_Point}]/gu;

/** True when a name has at least one visible character; joiners inside a name are kept. */
const hasVisibleText = (text: string): boolean => text.replace(INVISIBLE, '') !== '';

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

/** A vote belongs to a day only if it was cast on that date ("YYYY-MM-DD") in office local time. */
export const isOnDate = (
  vote: Vote,
  date: string,
  { utcOffsetHours }: VotingConfig = votingConfig,
): boolean => {
  const officeTime = new Date(Date.parse(vote.at) + utcOffsetHours * MS_IN_HOUR);

  return officeTime.toISOString().slice(0, 10) === date;
};

/**
 * Each user has one vote per day: their latest on-time one. Usernames that differ only in
 * case or surrounding spaces are the same user. Earlier votes and votes after
 * the cut-off do not count, nor, when a date is given, votes cast on another date. Votes with
 * a meal name or username with nothing visible do not count either, so a blank vote never
 * replaces a real one and nameless votes are not merged into one voter.
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
    if (!hasVisibleText(vote.meal) || !hasVisibleText(vote.user)) continue;
    const key = toUserKey(vote.user);
    const current = latestByUser.get(key);
    if (!current || Date.parse(vote.at) >= Date.parse(current.at)) {
      latestByUser.set(key, vote);
    }
  }

  return votes.filter((vote) => latestByUser.get(toUserKey(vote.user)) === vote);
};

/**
 * Each vote's status, in export order: counted, or the one reason it was not, checked as
 * blank, then other day (only when a date is given), then late, then replaced. "Counted" comes
 * from selectCountedVotes, so the list can never disagree with the tally.
 */
export const getVoteStatuses = (
  votes: Vote[],
  config: VotingConfig = votingConfig,
  date?: string,
): VoteStatus[] => {
  const countedVotes = new Set(selectCountedVotes(votes, config, date));

  return votes.map((vote) => {
    if (!hasVisibleText(vote.meal) || !hasVisibleText(vote.user)) return VoteStatus.BLANK;
    if (date !== undefined && !isOnDate(vote, date, config)) return VoteStatus.OTHER_DAY;
    if (!isOnTime(vote, config)) return VoteStatus.LATE;

    return countedVotes.has(vote) ? VoteStatus.COUNTED : VoteStatus.REPLACED;
  });
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
    .sort((a, b) => a.localeCompare(b, 'vi'));

  return { meals, votes: best };
};
