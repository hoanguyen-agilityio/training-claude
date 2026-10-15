export enum BaseVariant {
  PRIMARY = 'primary',
}

export type VoteDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface Vote {
  user: string;
  meal: string;
  /** ISO 8601 timestamp with offset, e.g. 2026-10-12T09:41:00+07:00 */
  at: string;
}

export interface VotingConfig {
  /** Daily cut-off in office local time, "HH:mm" */
  closesAt: string;
  /** Office offset from UTC, in hours */
  utcOffsetHours: number;
}

export type VoteTally = Record<string, number>;

export interface Winner {
  /** Every meal with the top count: empty when nobody voted on time, several on a tie */
  meals: string[];
  votes: number;
}

export interface VoteDayOption {
  id: VoteDay;
  label: string;
  date: string;
}
