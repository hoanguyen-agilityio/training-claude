// Libs
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

// Component
import { VoteTally } from '..';

const TALLY = { 'Cơm tấm': 1, 'Bún chả': 3 };
const UNEVEN_TALLY = { 'Phở bò': 1, 'Bánh mì': 1, 'Mì Quảng': 1 };
const TOTAL_LABEL = 'Total counted:';

describe('VoteTally', () => {
  test('lists meals from most to fewest votes', () => {
    // Bún chả (3) comes before Cơm tấm (1)
    render(<VoteTally tally={TALLY} />);

    const [, firstRow, secondRow] = screen.getAllByRole('row');
    expect(within(firstRow).getByText('“Bún chả”')).toBeInTheDocument();
    expect(within(firstRow).getByText('3')).toBeInTheDocument();
    expect(within(secondRow).getByText('“Cơm tấm”')).toBeInTheDocument();
  });

  test('shows each meal share of the counted votes', () => {
    // 3 of 4 is 75%, 1 of 4 is 25%
    render(<VoteTally tally={TALLY} />);

    const [, firstRow, secondRow] = screen.getAllByRole('row');
    expect(within(firstRow).getByText('75%')).toBeInTheDocument();
    expect(within(secondRow).getByText('25%')).toBeInTheDocument();
  });

  test('rounds each share to a whole percentage', () => {
    // 1 of 3 is 33.33…%, shown as 33% (rounded shares may sum to 99%)
    render(<VoteTally tally={UNEVEN_TALLY} />);

    expect(screen.getAllByText('33%')).toHaveLength(3);
  });

  test('ends the table with the total counted votes', () => {
    // 1 + 3 = 4 counted votes
    render(<VoteTally tally={TALLY} />);

    const lastRow = screen.getAllByRole('row').at(-1);
    expect(lastRow).toHaveTextContent(`${TOTAL_LABEL} 4`);
  });

  test('shows a zero total for an empty tally', () => {
    // Nobody counted: the table stays visible with header and total only
    render(<VoteTally tally={{}} />);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(rows.at(-1)).toHaveTextContent(`${TOTAL_LABEL} 0`);
  });
});
