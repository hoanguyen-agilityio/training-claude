// Libs
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Component
import { ResultsErrorBoundary } from '..';

const ERROR_MESSAGE = 'tally exploded';
const CHILD_TEXT = 'results';

const Throwing = () => {
  throw new TypeError(ERROR_MESSAGE);
};

describe('ResultsErrorBoundary', () => {
  // React and the boundary both log caught errors; keep the test output readable
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  test('renders its children when nothing throws', () => {
    // Healthy results pass straight through
    render(
      <ResultsErrorBoundary>
        <p>{CHILD_TEXT}</p>
      </ResultsErrorBoundary>,
    );

    expect(screen.getByText(CHILD_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('shows the error name and message when a child throws', () => {
    // A crash while computing results becomes a readable alert
    render(
      <ResultsErrorBoundary>
        <Throwing />
      </ResultsErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(`TypeError: ${ERROR_MESSAGE}`);
  });
});
