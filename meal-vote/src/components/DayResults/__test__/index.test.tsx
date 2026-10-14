// Libs
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

// Component
import { DayResults } from '..';

// Types
import type { Vote, VotingConfig } from '@/types';

const OFFICE_CONFIG: VotingConfig = { closesAt: '11:00', utcOffsetHours: 7 };
const WINNER = 'Bún chả';

const VOTES: Vote[] = [
  { user: 'an', meal: WINNER, at: '2026-10-14T09:30:00+07:00' },
  { user: 'binh', meal: WINNER, at: '2026-10-14T10:10:00+07:00' },
  { user: 'chi', meal: 'Cơm tấm', at: '2026-10-14T10:40:00+07:00' },
];

describe('DayResults', () => {
  test('shows the winner, the tally and every vote for the day', () => {
    // Three on-time votes, two of them for the winner
    render(<DayResults votes={VOTES} config={OFFICE_CONFIG} />);

    expect(screen.getByRole('region', { name: 'Winner' })).toHaveTextContent(WINNER);
    expect(screen.getByRole('region', { name: 'Tally' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: `Votes (${VOTES.length})` })).toBeInTheDocument();
  });
});
