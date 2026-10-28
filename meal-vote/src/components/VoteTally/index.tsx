// Types
import { BaseVariant, type VoteTally as VoteTallyData } from '@/types';

// Styles
import './styles/vote-tally.css';

const variantTheme = {
  [BaseVariant.PRIMARY]: {
    root: 'vote-tally-root',
    title: 'vote-tally-title',
    table: 'vote-tally-table',
    head: 'vote-tally-head',
    cell: 'vote-tally-cell',
    count: 'vote-tally-count',
    share: 'vote-tally-share',
    total: 'vote-tally-total',
  },
};

/** Whole-number percentage of the counted votes; 0 when nothing was counted (never NaN) */
const toShare = (count: number, total: number) =>
  total === 0 ? 0 : Math.round((count / total) * 100);

interface VoteTallyProps {
  tally: VoteTallyData;
  variant?: BaseVariant;
}

export const VoteTally = ({
  tally,
  variant = BaseVariant.PRIMARY,
}: VoteTallyProps) => {
  const theme = variantTheme[variant];
  const rows = Object.entries(tally).sort(([, a], [, b]) => b - a);
  const total = rows.reduce((sum, [, count]) => sum + count, 0);

  return (
    <section aria-label="Tally" className={theme.root}>
      <h2 className={theme.title}>Tally</h2>
      <table className={theme.table}>
        <thead>
          <tr>
            <th className={theme.head}>Meal (as recorded)</th>
            <th className={theme.head}>Votes</th>
            <th className={theme.head}>Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([meal, count]) => (
            <tr key={meal}>
              {/* Quoted so stray spaces in the recorded name stay visible */}
              <td className={theme.cell}>“{meal}”</td>
              <td className={theme.count}>{count}</td>
              <td className={theme.share}>{toShare(count, total)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className={theme.total}>
              Total counted: {total}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
};
