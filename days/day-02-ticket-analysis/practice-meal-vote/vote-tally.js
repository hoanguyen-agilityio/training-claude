// Picks the day's winning meal from the team's votes.
const config = require('./config.json')

// A vote counts only if it was cast before the daily cut-off, in office local time
function isOnTime(vote, { closesAt, utcOffsetHours }) {
  const at = new Date(vote.at)
  const minutesInDay = 24 * 60
  const local = ((at.getUTCHours() + utcOffsetHours) * 60 + at.getUTCMinutes()) % minutesInDay
  const [hours, minutes] = closesAt.split(':').map(Number)
  return (local + minutesInDay) % minutesInDay <= hours * 60 + minutes
}

function tallyVotes(votes, settings = config) {
  const counts = {}
  for (const vote of votes) {
    if (!isOnTime(vote, settings)) continue
    counts[vote.meal] = (counts[vote.meal] ?? 0) + 1
  }
  return counts
}

function pickWinner(votes, settings = config) {
  const counts = tallyVotes(votes, settings)
  let winner = null
  let best = 0
  for (const [meal, count] of Object.entries(counts)) {
    if (count >= best) {
      winner = meal
      best = count
    }
  }
  return { meal: winner, votes: best }
}

module.exports = { isOnTime, tallyVotes, pickWinner }
