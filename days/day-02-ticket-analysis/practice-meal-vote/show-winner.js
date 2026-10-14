// Usage: node show-winner.js votes-monday.json
const fs = require('node:fs')
const { tallyVotes, pickWinner } = require('./vote-tally')

const votes = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
console.log('Tally:', tallyVotes(votes))
console.log('Winner:', pickWinner(votes))
