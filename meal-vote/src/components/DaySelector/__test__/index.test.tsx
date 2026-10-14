// Libs
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

// Component
import { DaySelector } from '..';

// Constants
import { VOTE_DAYS } from '@/constants';

const [MONDAY, TUESDAY] = VOTE_DAYS;

describe('DaySelector', () => {
  test('renders one button per day and marks the selected one', () => {
    // Monday is selected, the others are not
    render(<DaySelector days={VOTE_DAYS} selected={MONDAY.id} onSelect={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(VOTE_DAYS.length);
    expect(screen.getByRole('button', { name: new RegExp(MONDAY.label) })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: new RegExp(TUESDAY.label) })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('reports the clicked day', async () => {
    // Clicking Tuesday asks the parent to select it
    const onSelect = vi.fn();
    render(<DaySelector days={VOTE_DAYS} selected={MONDAY.id} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: new RegExp(TUESDAY.label) }));

    expect(onSelect).toHaveBeenCalledWith(TUESDAY.id);
  });
});
