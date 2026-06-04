// api/promptGen.js
// Claude API prompt generation.

async function generateRound1Prompt(word1, word2) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CONSTANTS.AI_MODEL,
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Two players are about to draw. Player 1's word: "${word1}". Player 2's word: "${word2}".
Generate one short, funny, specific, drawable prompt combining both words.
Doable in 60 seconds by an amateur. Respond with ONLY the prompt, no quotes.`
      }]
    })
  })
  const data = await response.json()
  return data.content[0].text.trim()
}

async function generateAutoPrompt() {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CONSTANTS.AI_MODEL,
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Generate one short, funny, specific, drawable prompt for a drawing game.
Doable in 60 seconds by an amateur. Weird and fun. Seattle/PNW themed is a bonus.
Respond with ONLY the prompt, no quotes.`
      }]
    })
  })
  const data = await response.json()
  return data.content[0].text.trim()
}
