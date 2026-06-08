// screens/promptInput.js

let promptState = 'p1speak'  // p1speak → p2speak → loading → reveal → done
let spokenWords = { p1: '', p2: '' }
let generatedPrompt = ''
let revealScale = 0
let revealAlpha = 0
let loadingAngle = 0
let loadingShake = 0
let listeningFor = null  // 'p1' or 'p2'
let promptGrayCan = null
let revealTimer = 0
let loadingStartTime = 0
const MIN_LOADING_MS = 800  // always show loading for at least this long

function preloadPromptImages() {
  promptGrayCan = loadImage('assets/gray-spray-can.svg')
}

function resetPromptInput() {
  promptState = gameState.round === 1 ? 'p1speak' : 'loading'
  spokenWords = { p1: '', p2: '' }
  generatedPrompt = ''
  revealScale = 0
  revealAlpha = 0
  loadingAngle = 0
  loadingShake = 0
  listeningFor = null
  revealTimer = 0
  loadingStartTime = 0
}

// Called on SPACEBAR press — context-sensitive
// toggles mic open/closed for whoever's turn it is
function promptSpacePressed() {
  console.log('promptSpacePressed called, state:', promptState, 'listeningFor:', listeningFor)
  if (promptState === 'p1speak') {
    if (!listeningFor) {
      // Open mic for P1
      listeningFor = 'p1'
      startListening((word) => {
        if (listeningFor === 'p1' && word) {
          spokenWords.p1 = word
          // Don't auto-advance — wait for second space press to confirm
        }
      })
    } else {
      // Second press — lock P1's word and move to P2
      stopListening()
      setTimeout(() => {
        if (!spokenWords.p1) spokenWords.p1 = 'something'
        listeningFor = null
        promptState = 'p2speak'
      }, 300)
    }
  }

  else if (promptState === 'p2speak') {
    if (!listeningFor) {
      // Open mic for P2
      listeningFor = 'p2'
      startListening((word) => {
        if (listeningFor === 'p2' && word) {
          spokenWords.p2 = word
        }
      })
    } else {
      // Second press — lock P2's word and go to loading
      stopListening()
      setTimeout(() => {
        if (!spokenWords.p2) spokenWords.p2 = 'something'
        listeningFor = null
        promptState = 'loading'
        // loadingStartTime is set by draw_promptInput on next frame
      }, 300)
    }
  }
}

// Keep for bluetooth compatibility
function promptSpeakHeld(player) {
  promptSpacePressed()
}

async function triggerPromptGeneration() {
  try {
    let prompt
    if (gameState.round === 1) {
      prompt = await generateRound1Prompt(spokenWords.p1, spokenWords.p2)
    } else {
      prompt = await generateAutoPrompt()
    }
    generatedPrompt = prompt
    gameState.currentPrompt = prompt
    // Wait for minimum loading time before revealing
    const elapsed = millis() - loadingStartTime
    const remaining = max(0, MIN_LOADING_MS - elapsed)
    setTimeout(() => {
      promptState = 'reveal'
      revealScale = 0
      revealAlpha = 0
    }, remaining)
  } catch (e) {
    console.error('Prompt generation failed:', e)
    generatedPrompt = 'Draw something wild!'
    gameState.currentPrompt = generatedPrompt
    const elapsed = millis() - loadingStartTime
    const remaining = max(0, MIN_LOADING_MS - elapsed)
    setTimeout(() => {
      promptState = 'reveal'
      revealScale = 0
      revealAlpha = 0
    }, remaining)
  }
}

function draw_promptInput() {
  background(248, 246, 240)

  // Trigger generation once — only if loadingStartTime not already set by speech/DEV path
  console.log('draw_promptInput state:', promptState, 'generatedPrompt:', generatedPrompt, 'loadingStartTime:', loadingStartTime)
  if (promptState === 'loading' && generatedPrompt === '' && loadingStartTime === 0) {
    console.log('TRIGGERING GENERATION')
    loadingStartTime = millis()
    triggerPromptGeneration()
  }

  const cx = width / 2
  const cy = height / 2

  if (promptState === 'p1speak' || promptState === 'p2speak') {
    drawSpeakScreen(cx, cy)
  } else if (promptState === 'loading') {
    drawLoadingScreen(cx, cy)
  } else if (promptState === 'reveal') {
    drawRevealScreen(cx, cy)
  }
}

// ── Speak screen ─────────────────────────────────────────

function drawSpeakScreen(cx, cy) {
  const isP1turn = promptState === 'p1speak'
  const activeCol = isP1turn ? '#E8523A' : '#2E7FE8'
  const activePlayer = isP1turn ? 'PLAYER 1' : 'PLAYER 2'
  const isListening = listeningFor !== null

  drawSmallRoundLabel(cx)

  // ── Active player banner ──────────────────────────────
  const bannerH = height * 0.11
  noStroke()
  fill(activeCol)
  rect(0, height * 0.14, width, bannerH)

  fill(255)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.038)
  noStroke()
  if (isListening) {
    text(`${activePlayer} — SPEAK YOUR WORD!`, cx, height * 0.14 + bannerH / 2)
  } else if (spokenWords[isP1turn ? 'p1' : 'p2']) {
    text(`${activePlayer} — PRESS SPACE TO CONFIRM`, cx, height * 0.14 + bannerH / 2)
  } else {
    text(`${activePlayer} — PRESS SPACE TO SPEAK`, cx, height * 0.14 + bannerH / 2)
  }

  // ── Word bubbles ──────────────────────────────────────
  drawWordBubble(cx - width * 0.22, cy, spokenWords.p1, '#E8523A', 'P1', isP1turn && isListening)

  push()
  fill(80)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textSize(width * 0.05)
  noStroke()
  text('+', cx, cy)
  pop()

  drawWordBubble(cx + width * 0.22, cy, spokenWords.p2, '#2E7FE8', 'P2', !isP1turn && isListening)

  // ── Listening animation ───────────────────────────────
  if (isListening) {
    const micPulse = sin(frameCount * 0.18) * 14
    noFill()
    stroke(activeCol)
    strokeWeight(3)
    ellipse(cx, height * 0.8, 55 + micPulse, 55 + micPulse)
    ellipse(cx, height * 0.8, 85 + micPulse * 1.4, 85 + micPulse * 1.4)
    fill(activeCol)
    noStroke()
    textAlign(CENTER, CENTER)
    textSize(width * 0.032)
    text('🎤', cx, height * 0.8)

    // Live word preview — shows what's being heard
    const heardWord = spokenWords[isP1turn ? 'p1' : 'p2']
    if (heardWord) {
      push()
      fill(activeCol)
      noStroke()
      textFont('Impact, Arial Black, sans-serif')
      textStyle(BOLD)
      textSize(width * 0.022)
      textAlign(CENTER, CENTER)
      text(`"${heardWord.toUpperCase()}" — PRESS SPACE TO LOCK IN`, cx, height * 0.91)
      pop()
    } else {
      push()
      const pulse = sin(frameCount * 0.1) * 0.3 + 0.7
      fill(180 * pulse)
      noStroke()
      textFont('Impact, Arial Black, sans-serif')
      textSize(width * 0.018)
      textAlign(CENTER, CENTER)
      text('LISTENING...', cx, height * 0.91)
      pop()
    }
  } else {
    // Space prompt — pulses
    const pulse = sin(frameCount * 0.08) * 0.2 + 0.8
    push()
    const pillW = width * 0.3
    const pillH = height * 0.062
    fill(18, 18, 18, 255 * pulse)
    noStroke()
    rect(cx - pillW/2, height * 0.86 - pillH/2, pillW, pillH, pillH/2)
    fill(255, 255, 255, 255 * pulse)
    textAlign(CENTER, CENTER)
    textFont('Impact, Arial Black, sans-serif')
    textStyle(BOLD)
    textSize(width * 0.018)
    noStroke()
    text('PRESS SPACE', cx, height * 0.86)
    pop()
  }
}

function drawWordBubble(x, y, word, col, label, isActive) {
  push()
  translate(x, y)

  const bw = width * 0.18
  const bh = height * 0.22

  // Shadow
  fill(0, 0, 0, 40)
  noStroke()
  rect(-bw/2 + 5, -bh/2 + 5, bw, bh, 16)

  // Bubble
  if (word) {
    fill(col)
  } else if (isActive) {
    // Pulsing border when waiting for input
    const pulse = sin(frameCount * 0.1) * 30
    fill(255)
    stroke(col)
    strokeWeight(3 + pulse * 0.05)
  } else {
    fill(255)
    stroke(200)
    strokeWeight(2)
  }
  rect(-bw/2, -bh/2, bw, bh, 16)

  // Word text
  noStroke()
  if (word) {
    fill(255)
    textFont('Impact, Arial Black, sans-serif')
    textStyle(BOLD)
    textSize(width * 0.032)
    textAlign(CENTER, CENTER)
    text(word.toUpperCase(), 0, -8)
  } else {
    fill(isActive ? col : 200)
    textFont('Impact, Arial Black, sans-serif')
    textSize(width * 0.018)
    textAlign(CENTER, CENTER)
    text(isActive ? 'SPEAK!' : '?', 0, -8)
  }

  // Player label below bubble
  fill(col)
  noStroke()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textSize(width * 0.016)
  text(label, 0, bh/2 + 22)

  pop()
}

// ── Loading screen ────────────────────────────────────────

function drawLoadingScreen(cx, cy) {
  drawSmallRoundLabel(cx)

  // Title
  push()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.038)
  fill(18)
  noStroke()
  text('GENERATING PROMPT...', cx, height * 0.2)
  pop()

  // Word summary
  if (spokenWords.p1 || spokenWords.p2) {
    push()
    textAlign(CENTER, CENTER)
    textFont('Impact, Arial Black, sans-serif')
    textSize(width * 0.022)
    noStroke()
    fill('#E8523A')
    text(`"${spokenWords.p1.toUpperCase()}"`, cx - width * 0.12, height * 0.3)
    fill(80)
    text('+', cx, height * 0.3)
    fill('#2E7FE8')
    text(`"${spokenWords.p2.toUpperCase()}"`, cx + width * 0.12, height * 0.3)
    pop()
  }

  // Spinning + shaking spray can
  loadingAngle += 0.04
  loadingShake = sin(frameCount * 0.3) * 14

  push()
  translate(cx + loadingShake, cy + 30)
  rotate(sin(loadingAngle) * 0.25)

  if (promptGrayCan) {
    imageMode(CENTER)
    const canW = width * 0.18
    image(promptGrayCan, 0, 0, canW, canW * 0.8)
  }
  pop()

  // Spray dots flying off the can
  noStroke()
  for (let i = 0; i < 6; i++) {
    const angle = (frameCount * 0.08 + i * 1.05) % TWO_PI
    const r = 60 + sin(frameCount * 0.1 + i) * 20
    const dotX = cx + loadingShake + cos(angle) * r
    const dotY = cy + 30 + sin(angle) * r * 0.5
    const dotAlpha = map(sin(frameCount * 0.1 + i), -1, 1, 80, 200)
    const cols = ['#E8523A','#2E7FE8','#F5C842','#3DC47E']
    fill(cols[i % cols.length])
    ellipse(dotX, dotY, 10, 10)
  }

  // Dots loading indicator
  const dotCount = 3
  const dotSpacing = 24
  for (let i = 0; i < dotCount; i++) {
    const phase = (frameCount * 0.08 + i * 0.8) % TWO_PI
    const dotY = height * 0.82 + sin(phase) * 6
    fill(i === floor((frameCount * 0.05) % dotCount) ? 18 : 180)
    noStroke()
    ellipse(cx + (i - 1) * dotSpacing, dotY, 12, 12)
  }
}

// ── Reveal screen ─────────────────────────────────────────

function drawRevealScreen(cx, cy) {
  drawSmallRoundLabel(cx)

  // Animate in
  revealScale = lerp(revealScale, 1.0, 0.1)
  revealAlpha = lerp(revealAlpha, 255, 0.08)

  // Background flash on first frame
  if (revealScale < 0.15) {
    background(255)
  }

  // "YOUR PROMPT:" label
  push()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.028)
  fill(180)
  noStroke()
  text('YOUR PROMPT IS...', cx, height * 0.25)
  pop()

  // Main prompt text — scales in
  push()
  translate(cx, cy)
  scale(revealScale)

  // Outline
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.052)

  fill(255, 220, 0)
  for (let dx = -5; dx <= 5; dx += 5) {
    for (let dy = -5; dy <= 5; dy += 5) {
      if (dx === 0 && dy === 0) continue
      text(generatedPrompt, dx, dy)
    }
  }
  fill(18)
  text(generatedPrompt, 3, 4)
  fill(18)
  text(generatedPrompt, 0, 0)

  pop()

  // "GET READY TO DRAW!" — appears after prompt has mostly scaled in
  if (revealScale > 0.85) {
    revealTimer++
    const subAlpha = map(revealTimer, 0, 40, 0, 255)

    push()
    textAlign(CENTER, CENTER)
    textFont('Impact, Arial Black, sans-serif')
    textStyle(BOLD)
    textSize(width * 0.025)
    fill(red(color('#E8523A')), green(color('#E8523A')), blue(color('#E8523A')), subAlpha)
    noStroke()
    const bounce = sin(frameCount * 0.1) * 4
    text('GET READY TO DRAW!', cx, height * 0.78 + bounce)
    pop()

    // Auto-advance after 3 seconds
    if (revealTimer === 180) {
      startDrawRound()
      goToScreen('DRAWING')
    }
  }
}

// ── Shared helpers ────────────────────────────────────────

function drawSmallRoundLabel(cx) {
  push()
  const pillW = width * 0.1
  const pillH = height * 0.055
  fill(18)
  noStroke()
  rect(cx - pillW/2, height * 0.06, pillW, pillH, pillH/2)
  fill(255)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.018)
  text(`ROUND ${gameState.round}`, cx, height * 0.06 + pillH/2)
  pop()
}

// DEV keys
function promptKeyPressed(k) {
  if (gameState.screen !== 'PROMPT_INPUT') return

  // Space/a/s all open the real mic
  if (k === ' ' || k === 'a' || k === 's') promptSpacePressed()

  // f = fast skip with hardcoded words (to test later screens quickly)
  if (k === 'f') {
    if (promptState === 'p1speak') {
      spokenWords.p1 = 'cloud'
      listeningFor = null
      promptState = 'p2speak'
    } else if (promptState === 'p2speak') {
      spokenWords.p2 = 'raccoon'
      listeningFor = null
      promptState = 'loading'
      // loadingStartTime set by draw_promptInput
    }
  }
}