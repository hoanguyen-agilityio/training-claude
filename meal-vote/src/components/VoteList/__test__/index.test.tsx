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
const BINH = 'binh';
const BUN_CHA = 'Bún chả';
const COM_TAM = 'Cơm tấm';
const COUNTED = 'Yes';
const LATE = 'Late';
const OTHER_DAY = 'Other day';
const REPLACED = 'Replaced';
const BLANK = 'Blank';
const SPACES = '   ';
const ZERO_WIDTH_SPACE = '\u200b';
const WEDNESDAY = '2026-10-14';
const TUESDAY = '2026-10-13';
// User, Meal, Cast at, Counted
const COUNTED_COLUMN = 3;

/** A timestamp on the given date at the given office time ("HH:mm"). */
const castAt = (date: string, time: string): string => `${date}T${time}:00+07:00`;

/** The Counted cell of a table row. */
const countedCell = (row: HTMLElement): HTMLElement =>
  within(row).getAllByRole('cell')[COUNTED_COLUMN];

/** Matches the whole text of a cell, so "Late" does not match "Late 11:20". */
const exactly = (text: string): RegExp => new RegExp(`^${text}$`);

const VOTES: Vote[] = [
  { user: AN, meal: BUN_CHA, at: castAt(WEDNESDAY, '10:10') },
  { user: 'dung', meal: COM_TAM, at: castAt(WEDNESDAY, '11:20') },
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
      { user: AN, meal: BUN_CHA, at: castAt(WEDNESDAY, '09:30') },
      { user: AN, meal: COM_TAM, at: castAt(WEDNESDAY, '10:30') },
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
      { user: AN_CAPITALISED, meal: BUN_CHA, at: castAt(WEDNESDAY, '09:30') },
      { user: AN, meal: COM_TAM, at: castAt(WEDNESDAY, '10:30') },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, replacedRow, latestRow] = screen.getAllByRole('row');
    expect(within(replacedRow).getByText(REPLACED)).toBeInTheDocument();
    expect(within(latestRow).getByText(COUNTED)).toBeInTheDocument();
  });

  test('keeps a vote with a blank meal in the list, marked as blank', () => {
    // The blank row is shown so the kitchen can see it, but it does not count
    const votes: Vote[] = [
      { user: AN, meal: BUN_CHA, at: castAt(WEDNESDAY, '09:30') },
      { user: BINH, meal: SPACES, at: castAt(WEDNESDAY, '10:30') },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, realRow, blankRow] = screen.getAllByRole('row');
    expect(within(realRow).getByText(COUNTED)).toBeInTheDocument();
    expect(within(blankRow).getByText(BINH)).toBeInTheDocument();
    expect(within(blankRow).getByText(BLANK)).toBeInTheDocument();
  });

  test('keeps a vote from another date visible but marks it as other day', () => {
    // The Tuesday vote stays in the list so the export can be checked, but does not count
    const votes: Vote[] = [
      { user: AN, meal: BUN_CHA, at: castAt(WEDNESDAY, '10:10') },
      { user: BINH, meal: COM_TAM, at: castAt(TUESDAY, '10:10') },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, sameDayRow, otherDateRow] = screen.getAllByRole('row');
    expect(within(sameDayRow).getByText(COUNTED)).toBeInTheDocument();
    expect(within(otherDateRow).getByText(BINH)).toBeInTheDocument();
    expect(within(otherDateRow).getByText(OTHER_DAY)).toBeInTheDocument();
  });

  test('marks a vote with an invisible username as blank', () => {
    // A zero-width space looks like no name at all
    const votes: Vote[] = [{ user: ZERO_WIDTH_SPACE, meal: BUN_CHA, at: castAt(WEDNESDAY, '09:30') }];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, blankRow] = screen.getAllByRole('row');
    expect(within(blankRow).getByText(BLANK)).toBeInTheDocument();
  });

  test('shows one reason per vote, blank before other day and late', () => {
    // Both rows are late and from Tuesday; the first also has a blank meal
    const votes: Vote[] = [
      { user: AN, meal: SPACES, at: castAt(TUESDAY, '11:30') },
      { user: BINH, meal: COM_TAM, at: castAt(TUESDAY, '11:30') },
    ];

    render(<VoteList votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, blankRow, otherDayRow] = screen.getAllByRole('row');
    expect(countedCell(blankRow)).toHaveTextContent(exactly(BLANK));
    expect(countedCell(otherDayRow)).toHaveTextContent(exactly(OTHER_DAY));
  });

  test('says late without a time in the counted cell', () => {
    // The cast time already has its own column
    render(<VoteList votes={VOTES} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    const [, , lateRow] = screen.getAllByRole('row');
    expect(countedCell(lateRow)).toHaveTextContent(exactly(LATE));
  });

  test('shows the number of votes in the heading', () => {
    // Two votes in the export
    render(<VoteList votes={VOTES} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    expect(screen.getByRole('heading', { name: `Votes (${VOTES.length})` })).toBeInTheDocument();
  });
});
