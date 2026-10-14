// Components
import { VoteList } from '@/components/VoteList';
import { VoteTally } from '@/components/VoteTally';
import { WinnerCard } from '@/components/WinnerCard';

// Utils
import { pickWinner, tallyVotes } from '@/utils/vote-tally';

// Types
import { BaseVariant, type Vote, type VotingConfig } from '@/types';

// Styles
import './styles/day-results.css';

const variantTheme = {
  [BaseVariant.PRIMARY]: {
    root: 'day-results-root',
    grid: 'day-results-grid',
  },
};

interface DayResultsProps {
  votes: Vote[];
  config: VotingConfig;
  variant?: BaseVariant;
}

export const DayResults = ({
  votes,
  config,
  variant = BaseVariant.PRIMARY,
}: DayResultsProps) => {
  const theme = variantTheme[variant];
  const tally = tallyVotes(votes, config);
  const winner = pickWinner(votes, config);

  return (
    <div className={theme.root}>
      <WinnerCard winner={winner} closesAt={config.closesAt} />
      <div className={theme.grid}>
        <VoteTally tally={tally} />
        <VoteList votes={votes} config={config} />
      </div>
    </div>
  );
};
