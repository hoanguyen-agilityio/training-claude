// Libs
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

// Component
import { MealVoteDashboard } from '..';

// Constants
import { DEFAULT_VOTE_DAY } from '@/constants';

// Services
import { getVoteExport, parseVoteExport } from '@/services/vote-export';

// Stores
import { voteDayStore } from '@/stores/vote-day';

// Keep the real export by default; single tests swap in a broken one
vi.mock('@/services/vote-export', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/vote-export')>();
  return { ...actual, getVoteExport: vi.fn(actual.getVoteExport) };
});

const WEDNESDAY_LABEL = /Wednesday/;
const TUESDAY_LABEL = /Tuesday/;
const TUESDAY_WINNER = 'Bún bò';

describe('MealVoteDashboard', () => {
  // Unmount before resetting the shared store so the reset doesn't re-render a live tree
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.mocked(getVoteExport).mockRestore();
    voteDayStore.setDay(DEFAULT_VOTE_DAY);
  });

  test('shows the default day votes on first render', () => {
    // Monday is selected when the page opens
    render(<MealVoteDashboard />);

    const expected = getVoteExport(DEFAULT_VOTE_DAY).length;
    expect(screen.getByRole('heading', { name: `Votes (${expected})` })).toBeInTheDocument();
  });

  test('switches to the votes of the selected day', async () => {
    // Choosing Wednesday swaps the export being shown
    render(<MealVoteDashboard />);

    await userEvent.click(screen.getByRole('button', { name: WEDNESDAY_LABEL }));

    const expected = getVoteExport('wednesday').length;
    expect(screen.getByRole('heading', { name: `Votes (${expected})` })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: WEDNESDAY_LABEL })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('shows Tuesday results instead of an error', async () => {
    // Tuesday's export used to crash the tally on a null record
    render(<MealVoteDashboard />);

    await userEvent.click(screen.getByRole('button', { name: TUESDAY_LABEL }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Winner' })).toHaveTextContent(TUESDAY_WINNER);
  });

  test('shows the invalid record index when an export is broken', () => {
    // A null record must surface as a readable error, not as an empty result
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getVoteExport).mockImplementation((day) => parseVoteExport([null], day));

    render(<MealVoteDashboard />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid vote at index 0');
  });
});
