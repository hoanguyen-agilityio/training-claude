// Libs
import clsx from 'clsx';

// Utils
import { formatOfficeTime } from '@/utils/format-time';
import { getVoteStatuses } from '@/utils/vote-tally';

// Types
import { BaseVariant, VoteStatus, type Vote, type VotingConfig } from '@/types';

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
    notCounted: 'vote-list-not-counted',
  },
};

// What the Counted cell says: "Yes", or the one reason the vote did not count
const STATUS_LABELS: Record<VoteStatus, string> = {
  [VoteStatus.COUNTED]: 'Yes',
  [VoteStatus.BLANK]: 'Blank',
  [VoteStatus.OTHER_DAY]: 'Other day',
  [VoteStatus.LATE]: 'Late',
  [VoteStatus.REPLACED]: 'Replaced',
};

interface VoteListProps {
  votes: Vote[];
  config: VotingConfig;
  /** The selected day, "YYYY-MM-DD": votes cast on another date are listed but not counted */
  date: string;
  variant?: BaseVariant;
}

export const VoteList = ({
  votes,
  config,
  date,
  variant = BaseVariant.PRIMARY,
}: VoteListProps) => {
  const theme = variantTheme[variant];
  const statuses = getVoteStatuses(votes, config, date);

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
          {votes.map((vote, index) => {
            const status = statuses[index];
            const counted = status === VoteStatus.COUNTED;

            return (
              // A user can appear on several rows, so the row position is the only stable key
              <tr key={index}>
                <td className={theme.cell}>{vote.user}</td>
                <td className={clsx(theme.cell, theme.meal)}>“{vote.meal}”</td>
                <td className={theme.cell}>{formatOfficeTime(vote.at)}</td>
                <td className={clsx(theme.cell, counted ? theme.counted : theme.notCounted)}>
                  {STATUS_LABELS[status]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};
