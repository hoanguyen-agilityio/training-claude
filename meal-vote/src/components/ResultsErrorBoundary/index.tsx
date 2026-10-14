// Libs
import { Component, type ErrorInfo, type ReactNode } from 'react';

// Types
import { BaseVariant } from '@/types';

// Styles
import './styles/results-error-boundary.css';

const variantTheme = {
  [BaseVariant.PRIMARY]: {
    root: 'results-error-root',
    title: 'results-error-title',
    message: 'results-error-message',
    hint: 'results-error-hint',
  },
};

interface ResultsErrorBoundaryProps {
  children: ReactNode;
  variant?: BaseVariant;
}

interface ResultsErrorBoundaryState {
  error: Error | null;
}

export class ResultsErrorBoundary extends Component<
  ResultsErrorBoundaryProps,
  ResultsErrorBoundaryState
> {
  state: ResultsErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ResultsErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the full stack in the browser console so it can be pasted into a bug report
    console.error(error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    const theme = variantTheme[this.props.variant ?? BaseVariant.PRIMARY];

    if (error === null) return this.props.children;

    return (
      <section role="alert" className={theme.root}>
        <p className={theme.title}>Couldn&apos;t compute the results for this day</p>
        <pre className={theme.message}>
          {error.name}: {error.message}
        </pre>
        <p className={theme.hint}>The full stack trace is in the browser console.</p>
      </section>
    );
  }
}
