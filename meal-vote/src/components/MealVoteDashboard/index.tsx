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
import { BaseVariant, type VoteDay } from '@/types';

// Styles
import './styles/meal-vote-dashboard.css';

const variantTheme = {
  [BaseVariant.PRIMARY]: {
    root: 'meal-vote-dashboard-root',
  },
};

// Reads the export inside the error boundary, so an invalid export is shown as an error, not a blank page
const DayExportResults = ({ day }: { day: VoteDay }) => {
  const option = VOTE_DAYS.find(({ id }) => id === day);
  if (!option) throw new Error(`No date is configured for ${day}`);

  return <DayResults votes={getVoteExport(day)} config={votingConfig} date={option.date} />;
};

interface MealVoteDashboardProps {
  variant?: BaseVariant;
}

export const MealVoteDashboard = ({
  variant = BaseVariant.PRIMARY,
}: MealVoteDashboardProps) => {
  const theme = variantTheme[variant];
  const day = useSelectedDay();

  return (
    <div className={theme.root}>
      <DaySelector days={VOTE_DAYS} selected={day} onSelect={selectVoteDay} />
      {/* Keyed by day so a crash on one day doesn't stick when switching to another */}
      <ResultsErrorBoundary key={day}>
        <DayExportResults day={day} />
      </ResultsErrorBoundary>
    </div>
  );
};
