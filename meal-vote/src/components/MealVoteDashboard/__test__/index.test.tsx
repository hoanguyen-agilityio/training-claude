// Libs
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';

// Component
import { MealVoteDashboard } from '..';

// Constants
import { DEFAULT_VOTE_DAY } from '@/constants';

// Services
import { getVoteExport } from '@/services/vote-export';

// Stores
import { voteDayStore } from '@/stores/vote-day';

const WEDNESDAY_LABEL = /Wednesday/;

describe('MealVoteDashboard', () => {
  // Unmount before resetting the shared store so the reset doesn't re-render a live tree
  afterEach(() => {
    cleanup();
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
});
