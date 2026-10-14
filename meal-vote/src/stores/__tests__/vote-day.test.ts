// Libs
import { afterEach, describe, expect, test, vi } from 'vitest';

// Constants
import { DEFAULT_VOTE_DAY } from '@/constants';

// Stores
import { voteDayStore } from '@/stores/vote-day';

const NEXT_DAY = 'wednesday';

describe('voteDayStore', () => {
  afterEach(() => voteDayStore.setDay(DEFAULT_VOTE_DAY));

  test('starts on the default day', () => {
    // No selection made yet
    expect(voteDayStore.getState()).toBe(DEFAULT_VOTE_DAY);
  });

  test('notifies subscribers when the day changes', () => {
    // A subscriber receives the newly selected day
    const listener = vi.fn();
    voteDayStore.subscribe(listener);

    voteDayStore.setDay(NEXT_DAY);

    expect(voteDayStore.getState()).toBe(NEXT_DAY);
    expect(listener).toHaveBeenCalledWith(NEXT_DAY);
  });

  test('stops notifying after unsubscribe', () => {
    // An unsubscribed listener is not called again
    const listener = vi.fn();
    const unsubscribe = voteDayStore.subscribe(listener);

    unsubscribe();
    voteDayStore.setDay(NEXT_DAY);

    expect(listener).not.toHaveBeenCalled();
  });
});
