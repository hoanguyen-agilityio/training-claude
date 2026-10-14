// Libs
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

// Component
import { VoteTally } from '..';

const TALLY = { 'Cơm tấm': 1, 'Bún chả': 3 };

describe('VoteTally', () => {
  test('lists meals from most to fewest votes', () => {
    // Bún chả (3) comes before Cơm tấm (1)
    render(<VoteTally tally={TALLY} />);

    const [, firstRow, secondRow] = screen.getAllByRole('row');
    expect(within(firstRow).getByText('“Bún chả”')).toBeInTheDocument();
    expect(within(firstRow).getByText('3')).toBeInTheDocument();
    expect(within(secondRow).getByText('“Cơm tấm”')).toBeInTheDocument();
  });

  test('renders only the header row for an empty tally', () => {
    // No meals to list
    render(<VoteTally tally={{}} />);

    expect(screen.getAllByRole('row')).toHaveLength(1);
  });
});
