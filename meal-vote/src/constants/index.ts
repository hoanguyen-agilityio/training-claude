// Types
import type { VoteDayOption } from '@/types';

export const VOTE_DAYS: VoteDayOption[] = [
  { id: 'monday', label: 'Monday', date: '2026-10-12' },
  { id: 'tuesday', label: 'Tuesday', date: '2026-10-13' },
  { id: 'wednesday', label: 'Wednesday', date: '2026-10-14' },
];

export const DEFAULT_VOTE_DAY = VOTE_DAYS[0].id;

// Display only: vote times are always shown in the office's own timezone
export const OFFICE_TIME_ZONE = 'Asia/Ho_Chi_Minh';
