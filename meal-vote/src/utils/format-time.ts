// Constants
import { OFFICE_TIME_ZONE } from '@/constants';

const officeTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: OFFICE_TIME_ZONE,
});

/** Renders a vote timestamp as HH:mm in office time, independent of the voting config. */
export const formatOfficeTime = (iso: string): string =>
  officeTimeFormatter.format(new Date(iso));
