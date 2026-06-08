// api/promptGen.js

const PROXY_URL = 'http://localhost:3001/claude'

async function callClaude(prompt) {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CONSTANTS.AI_MODEL,
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error.message || 'API error')
  return data.content[0].text.trim()
}

async function generateRound1Prompt(word1, word2) {
  return callClaude(
    `Two players are about to draw together. Player 1's word: "${word1}". Player 2's word: "${word2}".
Generate one short, funny, specific, drawable prompt that combines both words in a surprising way.
Must be doable in 30 seconds by an amateur. Keep it under 10 words. Be unexpected, not literal.
Respond with ONLY the prompt. No quotes, no explanation.`
  )
}

const AUTO_PROMPTS = [
  // Easy to draw, easy to guess
  'Roller coaster',
  'Birthday cake',
  'Thunderstorm',
  'Bunk bed',
  'Sunburn',
  'Brain freeze',
  'Piggyback ride',
  'Speed bump',
  'Flat tire',
  'Brainstorm',
  "hot dog eating another hot dog",
  'Bookworm',
  'Earthquake',
  'Backpack',
  'Skateboard',
  'Snowball fight',
  'Pillow fight',
  'Tug of war',
  'Piggy bank',
  'Sandcastle',
  'Rainbow',
  'Quicksand',
  'Treehouse',
  'Waterfall',
  'Volcano',
  'Traffic jam',
  'Sleepwalking',
  'Sleepover',
  'Brain surgeon',
  'Couch potato',
  'Bookshelf',
  'Fire hydrant',
  'Leaning Tower of Pisa',
]

function generateAutoPrompt() {
  // Pick randomly, no repeats within a game session
  const available = AUTO_PROMPTS.filter(p => !gameState.usedAutoPrompts?.includes(p))
  const pool = available.length > 0 ? available : AUTO_PROMPTS
  const prompt = pool[Math.floor(Math.random() * pool.length)]
  if (!gameState.usedAutoPrompts) gameState.usedAutoPrompts = []
  gameState.usedAutoPrompts.push(prompt)
  return Promise.resolve(prompt)
}