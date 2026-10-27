// Config
import votingConfig from '@/config/voting.json';

// Data
import mondayExport from '@/data/votes-monday.json';
import tuesdayExport from '@/data/votes-tuesday.json';
import wednesdayExport from '@/data/votes-wednesday.json';
import thursdayExport from '@/data/votes-thursday.json';
import fridayExport from '@/data/votes-friday.json';

// Types
import type { Vote, VoteDay, VotingConfig } from '@/types';

const EXPORTS: Record<VoteDay, unknown> = {
  monday: mondayExport,
  tuesday: tuesdayExport,
  wednesday: wednesdayExport,
  thursday: thursdayExport,
  friday: fridayExport,
};

const VOTE_FIELDS = ['user', 'meal', 'at'] as const;

// ISO 8601 date and time, with or without a UTC offset ("Z" or "±HH:mm")
const ISO_TIMESTAMP =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2})(:(?<second>\d{2})(\.\d+)?)?(?<offset>Z|[+-](?<offsetHours>\d{2}):(?<offsetMinutes>\d{2}))?$/;

// No timezone is more than 14 hours from UTC (Kiribati is +14:00)
const MAX_OFFSET_HOURS = 14;
const MAX_OFFSET_MINUTES = 59;

const pad = (value: number): string => String(value).padStart(2, '0');

/** Writes an offset in hours as "±HH:mm", e.g. 7 → "+07:00", -3.5 → "-03:30". */
const formatUtcOffset = (hours: number): string => {
  const minutes = Math.round(Math.abs(hours) * 60);

  return `${hours < 0 ? '-' : '+'}${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
};

/**
 * Returns the timestamp with an explicit offset: one without an offset is office time,
 * never the viewer's timezone. Returns null when it is not a real ISO 8601 date and time.
 */
const toOfficeTimestamp = (at: string, { utcOffsetHours }: VotingConfig): string | null => {
  const groups = ISO_TIMESTAMP.exec(at)?.groups;
  if (!groups) return null;
  const [year, month, day, hour, minute, second] = [
    groups.year,
    groups.month,
    groups.day,
    groups.hour,
    groups.minute,
    groups.second ?? '0',
  ].map(Number);
  // Date.parse rolls impossible dates over (Feb 30 becomes Mar 2), so rebuild and compare
  const rebuilt = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const isRealTime =
    rebuilt.getUTCFullYear() === year &&
    rebuilt.getUTCMonth() === month - 1 &&
    rebuilt.getUTCDate() === day &&
    rebuilt.getUTCHours() === hour &&
    rebuilt.getUTCMinutes() === minute &&
    rebuilt.getUTCSeconds() === second;
  if (!isRealTime) return null;
  // Date.parse can't read an offset like +25:00 or +07:60, and the cut-off check would drop the vote
  const isRealOffset =
    Number(groups.offsetHours ?? 0) <= MAX_OFFSET_HOURS &&
    Number(groups.offsetMinutes ?? 0) <= MAX_OFFSET_MINUTES;
  if (!isRealOffset) return null;

  return groups.offset ? at : `${at}${formatUtcOffset(utcOffsetHours)}`;
};

const isVote = (record: unknown): record is Vote =>
  typeof record === 'object' &&
  record !== null &&
  VOTE_FIELDS.every((field) => typeof Reflect.get(record, field) === 'string');

/**
 * Checks a vote export from the voting system before anything tallies it.
 * The export is an external boundary, so a bad record fails here with its index
 * instead of as a TypeError deep inside the tally. Times without an offset are office time
 * (`utcOffsetHours`), so every vote leaves here with an explicit offset.
 */
export const parseVoteExport = (
  records: unknown,
  day: VoteDay,
  config: VotingConfig = votingConfig,
): Vote[] => {
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

  return records.filter(isVote).map((vote, index) => {
    const at = toOfficeTimestamp(vote.at, config);

    if (at === null) {
      throw new Error(
        `Invalid vote time at index ${index} in the ${day} export: ${JSON.stringify(vote.at)}`,
      );
    }

    return { ...vote, at };
  });
};

/** Returns one day's vote export as produced by the voting system. */
export const getVoteExport = (day: VoteDay): Vote[] => parseVoteExport(EXPORTS[day], day);
