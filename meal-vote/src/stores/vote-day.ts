// Constants
import { DEFAULT_VOTE_DAY } from '@/constants';

// Types
import type { VoteDay } from '@/types';

export type VoteDayHandler = (day: VoteDay) => void;

export const voteDayStore = (() => {
  let selectedDay: VoteDay = DEFAULT_VOTE_DAY;

  const listeners = new Set<VoteDayHandler>();

  const getState = (): VoteDay => selectedDay;

  const setDay = (day: VoteDay) => {
    selectedDay = day;
    listeners.forEach((listener) => listener(selectedDay));
  };

  const subscribe = (listener: VoteDayHandler) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return { getState, setDay, subscribe };
})();
