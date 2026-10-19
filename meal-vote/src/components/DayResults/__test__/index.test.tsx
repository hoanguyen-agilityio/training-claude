// Libs
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

// Component
import { DayResults } from '..';

// Types
import type { Vote, VotingConfig } from '@/types';

const OFFICE_CONFIG: VotingConfig = { closesAt: '11:00', utcOffsetHours: 7 };
const WINNER = 'Bún chả';
const COM_TAM = 'Cơm tấm';
const WEDNESDAY = '2026-10-14';

const VOTES: Vote[] = [
  { user: 'an', meal: WINNER, at: '2026-10-14T09:30:00+07:00' },
  { user: 'binh', meal: WINNER, at: '2026-10-14T10:10:00+07:00' },
  { user: 'chi', meal: COM_TAM, at: '2026-10-14T10:40:00+07:00' },
];

describe('DayResults', () => {
  test('shows the winner, the tally and every vote for the day', () => {
    // Three on-time votes, two of them for the winner
    render(<DayResults votes={VOTES} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    expect(screen.getByRole('region', { name: 'Winner' })).toHaveTextContent(WINNER);
    expect(screen.getByRole('region', { name: 'Tally' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: `Votes (${VOTES.length})` })).toBeInTheDocument();
  });

  test('leaves a vote from another date out of the winner', () => {
    // Two Tuesday votes for cơm tấm would beat bún chả if they counted
    const votes: Vote[] = [
      ...VOTES,
      { user: 'dung', meal: COM_TAM, at: '2026-10-13T10:00:00+07:00' },
      { user: 'em', meal: COM_TAM, at: '2026-10-13T10:05:00+07:00' },
    ];

    render(<DayResults votes={votes} config={OFFICE_CONFIG} date={WEDNESDAY} />);

    expect(screen.getByRole('region', { name: 'Winner' })).toHaveTextContent(WINNER);
  });
});
