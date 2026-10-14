// Types
import { BaseVariant, type Winner } from '@/types';

// Styles
import './styles/winner-card.css';

const variantTheme = {
  [BaseVariant.PRIMARY]: {
    root: 'winner-card-root',
    caption: 'winner-card-caption',
    meal: 'winner-card-meal',
    votes: 'winner-card-votes',
    empty: 'winner-card-empty',
  },
};

interface WinnerCardProps {
  winner: Winner;
  closesAt: string;
  variant?: BaseVariant;
}

export const WinnerCard = ({
  winner,
  closesAt,
  variant = BaseVariant.PRIMARY,
}: WinnerCardProps) => {
  const theme = variantTheme[variant];

  return (
    <section aria-label="Winner" className={theme.root}>
      <p className={theme.caption}>Today&apos;s lunch · votes until {closesAt}</p>
      {winner.meal === null ? (
        <p className={theme.empty}>No votes before the cut-off</p>
      ) : (
        <>
          <p className={theme.meal}>{winner.meal}</p>
          <p className={theme.votes}>
            {winner.votes} {winner.votes === 1 ? 'vote' : 'votes'}
          </p>
        </>
      )}
    </section>
  );
};
