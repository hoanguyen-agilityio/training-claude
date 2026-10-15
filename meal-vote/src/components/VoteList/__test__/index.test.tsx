// Libs
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// Component
import { VoteList } from '..';

// Types
import type { Vote, VotingConfig } from '@/types';

const OFFICE_CONFIG: VotingConfig = { closesAt: '11:00', utcOffsetHours: 7 };

const AN = 'an';
const BUN_CHA = 'Bún chả';
const COM_TAM = 'Cơm tấm';
const COUNTED = 'Yes';
const NOT_COUNTED = 'No';

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
    render(<VoteList votes={VOTES} config={OFFICE_CONFIG} />);

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

    render(<VoteList votes={votes} config={OFFICE_CONFIG} />);

    const [, replacedRow, latestRow] = screen.getAllByRole('row');
    expect(within(replacedRow).getByText(NOT_COUNTED)).toBeInTheDocument();
    expect(within(latestRow).getByText(COUNTED)).toBeInTheDocument();
    // Two rows for one user must not trip React's duplicate key warning
    expect(errors).not.toHaveBeenCalled();
  });

  test('shows the number of votes in the heading', () => {
    // Two votes in the export
    render(<VoteList votes={VOTES} config={OFFICE_CONFIG} />);

    expect(screen.getByRole('heading', { name: `Votes (${VOTES.length})` })).toBeInTheDocument();
  });
});
