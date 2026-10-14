// Libs
import clsx from 'clsx';

// Utils
import { formatOfficeTime } from '@/utils/format-time';
import { isOnTime } from '@/utils/vote-tally';

// Types
import { BaseVariant, type Vote, type VotingConfig } from '@/types';

// Styles
import './styles/vote-list.css';

const variantTheme = {
  [BaseVariant.PRIMARY]: {
    root: 'vote-list-root',
    title: 'vote-list-title',
    table: 'vote-list-table',
    head: 'vote-list-head',
    cell: 'vote-list-cell',
    meal: 'vote-list-meal',
    counted: 'vote-list-counted',
    late: 'vote-list-late',
  },
};

interface VoteListProps {
  votes: Vote[];
  config: VotingConfig;
  variant?: BaseVariant;
}

export const VoteList = ({
  votes,
  config,
  variant = BaseVariant.PRIMARY,
}: VoteListProps) => {
  const theme = variantTheme[variant];

  return (
    <section aria-label="Votes" className={theme.root}>
      <h2 className={theme.title}>Votes ({votes.length})</h2>
      <table className={theme.table}>
        <thead>
          <tr>
            <th className={theme.head}>User</th>
            <th className={theme.head}>Meal</th>
            <th className={theme.head}>Cast at (office time)</th>
            <th className={theme.head}>Counted</th>
          </tr>
        </thead>
        <tbody>
          {votes.map((vote) => {
            const counted = isOnTime(vote, config);

            return (
              <tr key={vote.user}>
                <td className={theme.cell}>{vote.user}</td>
                <td className={clsx(theme.cell, theme.meal)}>“{vote.meal}”</td>
                <td className={theme.cell}>{formatOfficeTime(vote.at)}</td>
                <td className={clsx(theme.cell, counted ? theme.counted : theme.late)}>
                  {counted ? 'Yes' : 'No'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};
