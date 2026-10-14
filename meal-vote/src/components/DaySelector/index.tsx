// Types
import { BaseVariant, type VoteDay, type VoteDayOption } from '@/types';

// Styles
import './styles/day-selector.css';

const variantTheme = {
  [BaseVariant.PRIMARY]: {
    root: 'day-selector-root',
    option: 'day-selector-option',
    label: 'day-selector-label',
    date: 'day-selector-date',
  },
};

interface DaySelectorProps {
  days: VoteDayOption[];
  selected: VoteDay;
  onSelect: (day: VoteDay) => void;
  variant?: BaseVariant;
}

export const DaySelector = ({
  days,
  selected,
  onSelect,
  variant = BaseVariant.PRIMARY,
}: DaySelectorProps) => {
  const theme = variantTheme[variant];

  return (
    <div role="group" aria-label="Vote day" className={theme.root}>
      {days.map(({ id, label, date }) => (
        <button
          key={id}
          type="button"
          className={theme.option}
          aria-pressed={id === selected}
          onClick={() => onSelect(id)}
        >
          <span className={theme.label}>{label}</span>
          <span className={theme.date}>{date}</span>
        </button>
      ))}
    </div>
  );
};
