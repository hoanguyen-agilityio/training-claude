// Libs
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// Component
import { VoteList } from '..';

// Types
import type { Vote, VotingConfig } from '@/types';

const OFFICE_CONFIG: VotingConfig = { closesAt: '11:00', utcOffsetHours: 7 };

const AN = 'an';
const AN_CAPITALISED = 'An';
const BUN_CHA = 'Bún chả';
const COM_TAM = 'Cơm tấm';
const COUNTED = 'Yes';
const NOT_COUNTED = 'No';
const WEDNESDAY = '2026-10-14';

const VOTES: Vote[] = [
  { user: AN, meal: BUN_CHA, at: '2026-10-14T10:10:00+07:00' },
  { user: 'dung', meal: COM_TAM, at: '2026-10-14T11:20:00+07:00' },
];

describe('VoteList', () => {
  // Restore console.error even when an assertion fails before the end of a test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('shows each vote with its office time and whether it counted', () => {
    // An on-time vote and a late one
    render(<VoteList votes={VOTES} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, onTimeRow, lateRow] = screen.getAllByRole('row');
    expect(within(onTimeRow).getByText(AN)).toBeInTheDocument();
    expect(within(onTimeRow).getByText('10:10')).toBeInTheDocument();
    expect(within(onTimeRow).getByText(COUNTED)).toBeInTheDocument();
    expect(within(lateRow).getByText('11:20')).toBeInTheDocument();
    expect(within(lateRow).getByText(NOT_COUNTED)).toBeInTheDocument();
  });

  test('marks a vote replaced by the same user as not counted', () => {
    // An changed their mind before the cut-off: only the later vote counts
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const votes: Vote[] = [
      { user: AN, meal: BUN_CHA, at: '2026-10-14T09:30:00+07:00' },
      { user: AN, meal: COM_TAM, at: '2026-10-14T10:30:00+07:00' },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, replacedRow, latestRow] = screen.getAllByRole('row');
    expect(within(replacedRow).getByText(NOT_COUNTED)).toBeInTheDocument();
    expect(within(latestRow).getByText(COUNTED)).toBeInTheDocument();
    // Two rows for one user must not trip React's duplicate key warning
    expect(errors).not.toHaveBeenCalled();
  });

  test('marks a vote replaced under a differently cased username as not counted', () => {
    // "An" and "an" are one voter, so the earlier row no longer counts
    const votes: Vote[] = [
      { user: AN_CAPITALISED, meal: BUN_CHA, at: '2026-10-14T09:30:00+07:00' },
      { user: AN, meal: COM_TAM, at: '2026-10-14T10:30:00+07:00' },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, replacedRow, latestRow] = screen.getAllByRole('row');
    expect(within(replacedRow).getByText(NOT_COUNTED)).toBeInTheDocument();
    expect(within(latestRow).getByText(COUNTED)).toBeInTheDocument();
  });

  test('keeps a vote with a blank meal in the list, marked as not counted', () => {
    // The blank row is shown so the kitchen can see it, but it does not count
    const votes: Vote[] = [
      { user: AN, meal: BUN_CHA, at: '2026-10-14T09:30:00+07:00' },
      { user: 'binh', meal: '   ', at: '2026-10-14T10:30:00+07:00' },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, realRow, blankRow] = screen.getAllByRole('row');
    expect(within(realRow).getByText(COUNTED)).toBeInTheDocument();
    expect(within(blankRow).getByText('binh')).toBeInTheDocument();
    expect(within(blankRow).getByText(NOT_COUNTED)).toBeInTheDocument();
  });

  test('keeps a vote from another date visible but marks it as not counted', () => {
    // The Tuesday vote stays in the list so the export can be checked, but does not count
    const votes: Vote[] = [
      { user: AN, meal: BUN_CHA, at: '2026-10-14T10:10:00+07:00' },
      { user: 'binh', meal: COM_TAM, at: '2026-10-13T10:10:00+07:00' },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, sameDayRow, otherDateRow] = screen.getAllByRole('row');
    expect(within(sameDayRow).getByText(COUNTED)).toBeInTheDocument();
    expect(within(otherDateRow).getByText('binh')).toBeInTheDocument();
    expect(within(otherDateRow).getByText(NOT_COUNTED)).toBeInTheDocument();
  });

  test('shows the number of votes in the heading', () => {
    // Two votes in the export
    render(<VoteList votes={VOTES} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    expect(screen.getByRole('heading', { name: `Votes (${VOTES.length})` })).toBeInTheDocument();
  });
});
