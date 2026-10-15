// Libs
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

// Component
import { WinnerCard } from '..';

const CLOSES_AT = '11:00';
const MEAL = 'Bún chả';
const TIED_MEAL = 'Cơm gà';
const VOTES = 3;

describe('WinnerCard', () => {
  test('shows the winning meal and its vote count', () => {
    // A normal day with a clear winner
    render(<WinnerCard winner={{ meals: [MEAL], votes: VOTES }} closesAt={CLOSES_AT} />);

    expect(screen.getByText(MEAL)).toBeInTheDocument();
    expect(screen.getByText(`${VOTES} votes`)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(CLOSES_AT))).toBeInTheDocument();
  });

  test('uses the singular for a single vote', () => {
    // One vote reads "1 vote", not "1 votes"
    render(<WinnerCard winner={{ meals: [MEAL], votes: 1 }} closesAt={CLOSES_AT} />);

    expect(screen.getByText('1 vote')).toBeInTheDocument();
  });

  test('shows a tie with every tied meal', () => {
    // Two meals share the top count, so neither is shown as the only winner
    render(<WinnerCard winner={{ meals: [MEAL, TIED_MEAL], votes: VOTES }} closesAt={CLOSES_AT} />);

    expect(screen.getByText(`Tie: ${MEAL}, ${TIED_MEAL}`)).toBeInTheDocument();
    expect(screen.getByText(`${VOTES} votes each`)).toBeInTheDocument();
  });

  test('shows an empty state when there is no winner', () => {
    // Nobody voted before the cut-off
    render(<WinnerCard winner={{ meals: [], votes: 0 }} closesAt={CLOSES_AT} />);

    expect(screen.getByText('No votes before the cut-off')).toBeInTheDocument();
  });
});
