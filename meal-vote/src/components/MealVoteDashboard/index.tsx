// Components
import { DayResults } from '@/components/DayResults';
import { DaySelector } from '@/components/DaySelector';
import { ResultsErrorBoundary } from '@/components/ResultsErrorBoundary';

// Config
import votingConfig from '@/config/voting.json';

// Constants
import { VOTE_DAYS } from '@/constants';

// Services
import { getVoteExport } from '@/services/vote-export';

// Stores
import { selectVoteDay, useSelectedDay } from '@/stores/hooks';

// Types
import { BaseVariant } from '@/types';

// Styles
import './styles/meal-vote-dashboard.css';

const variantTheme = {
  [BaseVariant.PRIMARY]: {
    root: 'meal-vote-dashboard-root',
  },
};

interface MealVoteDashboardProps {
  variant?: BaseVariant;
}

export const MealVoteDashboard = ({
  variant = BaseVariant.PRIMARY,
}: MealVoteDashboardProps) => {
  const theme = variantTheme[variant];
  const day = useSelectedDay();
  const votes = getVoteExport(day);

  return (
    <div className={theme.root}>
      <DaySelector days={VOTE_DAYS} selected={day} onSelect={selectVoteDay} />
      {/* Keyed by day so a crash on one day doesn't stick when switching to another */}
      <ResultsErrorBoundary key={day}>
        <DayResults votes={votes} config={votingConfig} />
      </ResultsErrorBoundary>
    </div>
  );
};
