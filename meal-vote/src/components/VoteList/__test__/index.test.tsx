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
const LATE = 'Late';
const OTHER_DAY = 'Other day';
const REPLACED = 'Replaced';
const BLANK = 'Blank';
const ZERO_WIDTH_SPACE = '\u200b';
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

  test('shows each vote with its office time and why a late one did not count', () => {
    // An on-time vote and a late one
    render(<VoteList votes={VOTES} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, onTimeRow, lateRow] = screen.getAllByRole('row');
    expect(within(onTimeRow).getByText(AN)).toBeInTheDocument();
    expect(within(onTimeRow).getByText('10:10')).toBeInTheDocument();
    expect(within(onTimeRow).getByText(COUNTED)).toBeInTheDocument();
    expect(within(lateRow).getByText('11:20')).toBeInTheDocument();
    expect(within(lateRow).getByText(LATE)).toBeInTheDocument();
  });

  test('marks a vote replaced by the same user as replaced', () => {
    // An changed their mind before the cut-off: only the later vote counts
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const votes: Vote[] = [
      { user: AN, meal: BUN_CHA, at: '2026-10-14T09:30:00+07:00' },
      { user: AN, meal: COM_TAM, at: '2026-10-14T10:30:00+07:00' },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, replacedRow, latestRow] = screen.getAllByRole('row');
    expect(within(replacedRow).getByText(REPLACED)).toBeInTheDocument();
    expect(within(latestRow).getByText(COUNTED)).toBeInTheDocument();
    // Two rows for one user must not trip React's duplicate key warning
    expect(errors).not.toHaveBeenCalled();
  });

  test('marks a vote replaced under a differently cased username as replaced', () => {
    // "An" and "an" are one voter, so the earlier row no longer counts
    const votes: Vote[] = [
      { user: AN_CAPITALISED, meal: BUN_CHA, at: '2026-10-14T09:30:00+07:00' },
      { user: AN, meal: COM_TAM, at: '2026-10-14T10:30:00+07:00' },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, replacedRow, latestRow] = screen.getAllByRole('row');
    expect(within(replacedRow).getByText(REPLACED)).toBeInTheDocument();
    expect(within(latestRow).getByText(COUNTED)).toBeInTheDocument();
  });

  test('keeps a vote with a blank meal in the list, marked as blank', () => {
    // The blank row is shown so the kitchen can see it, but it does not count
    const votes: Vote[] = [
      { user: AN, meal: BUN_CHA, at: '2026-10-14T09:30:00+07:00' },
      { user: 'binh', meal: '   ', at: '2026-10-14T10:30:00+07:00' },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, realRow, blankRow] = screen.getAllByRole('row');
    expect(within(realRow).getByText(COUNTED)).toBeInTheDocument();
    expect(within(blankRow).getByText('binh')).toBeInTheDocument();
    expect(within(blankRow).getByText(BLANK)).toBeInTheDocument();
  });

  test('keeps a vote from another date visible but marks it as other day', () => {
    // The Tuesday vote stays in the list so the export can be checked, but does not count
    const votes: Vote[] = [
      { user: AN, meal: BUN_CHA, at: '2026-10-14T10:10:00+07:00' },
      { user: 'binh', meal: COM_TAM, at: '2026-10-13T10:10:00+07:00' },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, sameDayRow, otherDateRow] = screen.getAllByRole('row');
    expect(within(sameDayRow).getByText(COUNTED)).toBeInTheDocument();
    expect(within(otherDateRow).getByText('binh')).toBeInTheDocument();
    expect(within(otherDateRow).getByText(OTHER_DAY)).toBeInTheDocument();
  });

  test('marks a vote with an invisible username as blank', () => {
    // A zero-width space looks like no name at all
    const votes: Vote[] = [{ user: ZERO_WIDTH_SPACE, meal: BUN_CHA, at: '2026-10-14T09:30:00+07:00' }];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, blankRow] = screen.getAllByRole('row');
    expect(within(blankRow).getByText(BLANK)).toBeInTheDocument();
  });

  test('shows one reason per vote, blank before other day and late', () => {
    // A blank meal cast late on Tuesday, and a late vote from Tuesday
    const votes: Vote[] = [
      { user: AN, meal: '   ', at: '2026-10-13T11:30:00+07:00' },
      { user: 'binh', meal: COM_TAM, at: '2026-10-13T11:30:00+07:00' },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, blankRow, otherDayRow] = screen.getAllByRole('row');
    expect(within(blankRow).getAllByRole('cell')[3]).toHaveTextContent(new RegExp(`^${BLANK}$`));
    expect(within(otherDayRow).getAllByRole('cell')[3]).toHaveTextContent(
      new RegExp(`^${OTHER_DAY}$`),
    );
  });

  test('says late without a time in the counted cell', () => {
    // The cast time already has its own column
    render(<VoteList votes={VOTES} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, , lateRow] = screen.getAllByRole('row');
    expect(within(lateRow).getAllByRole('cell')[3]).toHaveTextContent(new RegExp(`^${LATE}$`));
  });

  test('shows the number of votes in the heading', () => {
    // Two votes in the export
    render(<VoteList votes={VOTES} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    expect(screen.getByRole('heading', { name: `Votes (${VOTES.length})` })).toBeInTheDocument();
  });
});
