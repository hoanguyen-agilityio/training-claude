// Libs
import { useSyncExternalStore } from 'react';

// Stores
import { voteDayStore } from './vote-day';

// States
export const useSelectedDay = () =>
  useSyncExternalStore(
    voteDayStore.subscribe,
    voteDayStore.getState,
    voteDayStore.getState,
  );

// Actions
export const selectVoteDay = voteDayStore.setDay;
