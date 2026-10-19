// Libs
import { describe, expect, test } from 'vitest';

// Services
import { getVoteExport } from '@/services/vote-export';

// Utils
import { isOnDate, isOnTime, pickWinner, tallyVotes } from '@/utils/vote-tally';

// Types
import type { Vote, VotingConfig } from '@/types';

// The office's real settings, passed explicitly so these tests don't depend on the shipped config
const OFFICE_CONFIG: VotingConfig = { closesAt: '11:00', utcOffsetHours: 7 };

const PHO = 'Phở bò';
const PHO_LOWERCASE = 'phở bò';
const PHO_PADDED = '  Phở  bò ';
const COM_TAM = 'Cơm tấm';
const BUN_CHA = 'Bún chả';
const BUN_RIEU = 'Bún riêu';
const COM_GA = 'Cơm gà';
const BANH_MI = 'Bánh mì';
const MI_QUANG = 'Mì Quảng';
const BLANK = '';
const SPACES = '   ';

const AN = 'an';
const AN_CAPITALISED = 'An';
const AN_PADDED = ' an ';

const MONDAY = '2026-10-12';

const voteAt = (at: string): Vote => ({ user: AN, meal: PHO, at });

const vote = (user: string, meal: string, localTime: string): Vote => ({
  user,
  meal,
  at: `2026-10-14T${localTime}:00+07:00`,
});

describe('isOnTime', () => {
  test('accepts a vote cast before the cut-off', () => {
    // 10:55 local is five minutes before 11:00
    expect(isOnTime(vote('an', PHO, '10:55'), OFFICE_CONFIG)).toBe(true);
  });

  test('accepts a vote cast exactly at the cut-off', () => {
    // The cut-off minute itself still counts
    expect(isOnTime(vote('an', PHO, '11:00'), OFFICE_CONFIG)).toBe(true);
  });

  test('rejects a vote cast after the cut-off', () => {
    // 11:20 local is past 11:00 in office time
    expect(isOnTime(vote('an', PHO, '11:20'), OFFICE_CONFIG)).toBe(false);
  });
});

describe('isOnDate', () => {
  test('accepts a vote cast on the selected day', () => {
    // 09:30 on Monday in office time
    expect(isOnDate(voteAt('2026-10-12T09:30:00+07:00'), MONDAY, OFFICE_CONFIG)).toBe(true);
  });

  test('rejects votes cast on the day before or the day after', () => {
    // Sunday and Tuesday votes do not belong in the Monday export
    expect(isOnDate(voteAt('2026-10-11T10:00:00+07:00'), MONDAY, OFFICE_CONFIG)).toBe(false);
    expect(isOnDate(voteAt('2026-10-13T10:00:00+07:00'), MONDAY, OFFICE_CONFIG)).toBe(false);
  });

  test('reads the date in office time, not UTC or the browser timezone', () => {
    // 01:00Z and 23:30Z the night before are Monday morning at UTC+7; 18:00Z is Tuesday 01:00
    expect(isOnDate(voteAt('2026-10-12T01:00:00Z'), MONDAY, OFFICE_CONFIG)).toBe(true);
    expect(isOnDate(voteAt('2026-10-11T23:30:00Z'), MONDAY, OFFICE_CONFIG)).toBe(true);
    expect(isOnDate(voteAt('2026-10-12T18:00:00Z'), MONDAY, OFFICE_CONFIG)).toBe(false);
  });
});

describe('tallyVotes', () => {
  test('skips votes stamped with another date than the selected day', () => {
    // Only binh voted on Monday; the Sunday and Tuesday votes must not count
    const votes: Vote[] = [
      { user: AN, meal: COM_TAM, at: '2026-10-11T10:00:00+07:00' },
      { user: 'binh', meal: PHO, at: '2026-10-12T01:00:00Z' },
      { user: 'chi', meal: COM_TAM, at: '2026-10-13T09:00:00+07:00' },
    ];

    expect(tallyVotes(votes, OFFICE_CONFIG, MONDAY)).toEqual({ [PHO]: 1 });
  });


  test('counts on-time votes per meal and skips late ones', () => {
    // Two on-time votes for phở, one on-time and one late for cơm tấm
    const votes = [
      vote('an', PHO, '09:30'),
      vote('binh', PHO, '10:10'),
      vote('chi', COM_TAM, '10:40'),
      vote('dung', COM_TAM, '11:20'),
    ];

    expect(tallyVotes(votes, OFFICE_CONFIG)).toEqual({ [PHO]: 2, [COM_TAM]: 1 });
  });

  test('counts names that differ only in case or spacing as one meal', () => {
    // Three spellings of phở bò are one meal, shown with the first spelling
    const votes = [
      vote('an', PHO, '09:41'),
      vote('binh', PHO_LOWERCASE, '09:58'),
      vote('chi', PHO_PADDED, '10:12'),
      vote('dung', COM_TAM, '10:20'),
      vote('em', COM_TAM, '10:33'),
    ];

    expect(tallyVotes(votes, OFFICE_CONFIG)).toEqual({ [PHO]: 3, [COM_TAM]: 2 });
  });

  test('counts only the latest on-time vote of a user who voted more than once', () => {
    // An voted phở twice and then switched to cơm tấm, so an counts once, for cơm tấm
    const votes = [
      vote('an', PHO, '09:30'),
      vote('an', PHO, '09:31'),
      vote('binh', PHO, '10:10'),
      vote('an', COM_TAM, '10:40'),
    ];

    expect(tallyVotes(votes, OFFICE_CONFIG)).toEqual({ [PHO]: 1, [COM_TAM]: 1 });
  });

  test('counts usernames that differ only in case or surrounding spaces as one user', () => {
    // An, an and " an " are one voter whose latest on-time vote is cơm tấm
    const votes = [
      vote(AN_CAPITALISED, PHO, '09:30'),
      vote(AN, PHO, '09:45'),
      vote('binh', PHO, '10:10'),
      vote(AN_PADDED, COM_TAM, '10:40'),
    ];

    expect(tallyVotes(votes, OFFICE_CONFIG)).toEqual({ [PHO]: 1, [COM_TAM]: 1 });
  });

  test('keeps the on-time vote when the same user votes again after the cut-off', () => {
    // A late change of mind does not replace a vote cast in time
    const votes = [vote('an', PHO, '10:30'), vote('an', COM_TAM, '11:15')];

    expect(tallyVotes(votes, OFFICE_CONFIG)).toEqual({ [PHO]: 1 });
  });

  test('skips votes whose meal name is empty or only spaces', () => {
    // A blank meal is no meal, so only phở is counted
    const votes = [
      vote('an', PHO, '09:30'),
      vote('binh', BLANK, '09:45'),
      vote('chi', SPACES, '10:10'),
    ];

    expect(tallyVotes(votes, OFFICE_CONFIG)).toEqual({ [PHO]: 1 });
  });

  test('keeps the earlier vote when the same user later sends a blank meal', () => {
    // An's blank vote at 10:40 does not replace their phở vote
    const votes = [vote('an', PHO, '09:30'), vote('an', SPACES, '10:40')];

    expect(tallyVotes(votes, OFFICE_CONFIG)).toEqual({ [PHO]: 1 });
  });

  test('returns an empty tally when there are no votes', () => {
    // Nothing to count
    expect(tallyVotes([], OFFICE_CONFIG)).toEqual({});
  });
});

describe('pickWinner', () => {
  test('picks the meal with the most on-time votes', () => {
    // Phở has 2 votes against 1 for cơm tấm
    const votes = [
      vote('an', PHO, '09:30'),
      vote('binh', PHO, '10:10'),
      vote('chi', COM_TAM, '10:40'),
    ];

    expect(pickWinner(votes, OFFICE_CONFIG)).toEqual({ meals: [PHO], votes: 2 });
  });

  test('names every meal that shares the top count, in alphabetical order', () => {
    // Mì Quảng and bánh mì tie on 2; the order must not follow the export
    const votes = [
      vote('an', MI_QUANG, '09:10'),
      vote('binh', BANH_MI, '09:25'),
      vote('chi', MI_QUANG, '09:40'),
      vote('dung', BANH_MI, '10:00'),
      vote('em', BUN_CHA, '10:20'),
    ];

    expect(pickWinner(votes, OFFICE_CONFIG)).toEqual({ meals: [BANH_MI, MI_QUANG], votes: 2 });
    expect(pickWinner([...votes].reverse(), OFFICE_CONFIG)).toEqual({
      meals: [BANH_MI, MI_QUANG],
      votes: 2,
    });
  });

  test('never names a blank meal as the winner', () => {
    // Two blank votes outnumber the single phở vote but must not win
    const votes = [
      vote('an', PHO, '09:30'),
      vote('binh', BLANK, '09:45'),
      vote('chi', SPACES, '10:10'),
    ];

    expect(pickWinner(votes, OFFICE_CONFIG)).toEqual({ meals: [PHO], votes: 1 });
  });

  test('reports no winner when nobody voted on time', () => {
    // The only vote is late
    expect(pickWinner([vote('an', PHO, '11:30')], OFFICE_CONFIG)).toEqual({
      meals: [],
      votes: 0,
    });
  });
});

describe('shipped voting config', () => {
  test('counts a vote at 11:00 office time but not one at 11:01', () => {
    // The cut-off is 11:00 in Vietnam time (UTC+7), not UTC
    expect(isOnTime(vote('an', PHO, '11:00'))).toBe(true);
    expect(isOnTime(vote('an', PHO, '11:01'))).toBe(false);
  });

  test('gives Wednesday to bún chả once late votes are dropped', () => {
    // Three cơm tấm votes came in after 11:00 and must not count
    expect(pickWinner(getVoteExport('wednesday'))).toEqual({ meals: [BUN_CHA], votes: 3 });
  });
});

describe('shipped vote exports', () => {
  test('gives Friday a tie between bánh mì and mì quảng', () => {
    // Both meals have 2 votes; neither may win alone
    expect(pickWinner(getVoteExport('friday'))).toEqual({ meals: [BANH_MI, MI_QUANG], votes: 2 });
  });

  test('gives Monday to phở bò across its spellings', () => {
    // Monday's export spells phở bò three ways
    expect(pickWinner(getVoteExport('monday'))).toEqual({ meals: [PHO], votes: 3 });
  });

  test('gives Thursday to bún riêu once each user counts once', () => {
    // An voted cơm gà three times and giang switched to bún riêu; dung's late switch is ignored
    expect(tallyVotes(getVoteExport('thursday'))).toEqual({ [BUN_RIEU]: 3, [COM_GA]: 2 });
    expect(pickWinner(getVoteExport('thursday'))).toEqual({ meals: [BUN_RIEU], votes: 3 });
  });
});
