// proxy.js
// Run this with: node proxy.js
// Sits between the browser and the Anthropic API to handle CORS.
// Requires Node.js. Install dependency once with: npm install express

require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())

// Replace with your actual Anthropic API key  - MAKE AN ENV VARIABLE OR JUST HARD CODE MY KEY LOL
// MAKE A .gitignore file and add .env to it so you don't accidentally commit my key
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

// Allow requests from localhost 
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.post('/claude', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3001, () => console.log('Proxy running at http://localhost:3001'))