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
  const { meals, votes } = winner;
  const isTie = meals.length > 1;

  return (
    <section aria-label="Winner" className={theme.root}>
      <p className={theme.caption}>Today&apos;s lunch · votes until {closesAt}</p>
      {meals.length === 0 ? (
        <p className={theme.empty}>No votes before the cut-off</p>
      ) : (
        <>
          <p className={theme.meal}>{isTie ? `Tie: ${meals.join(', ')}` : meals[0]}</p>
          <p className={theme.votes}>
            {votes} {votes === 1 ? 'vote' : 'votes'}
            {isTie && ' each'}
          </p>
        </>
      )}
    </section>
  );
};
