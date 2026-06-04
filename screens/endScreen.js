// screens/endScreen.js

let endAnimFrame = 0
let endStatAlpha = 0
let endCtaAlpha = 0
let endButtonAlpha = 0

function resetEndScreen() {
  endAnimFrame = 0
  endStatAlpha = 0
  endCtaAlpha = 0
  endButtonAlpha = 0
}

function endAdvance() {
  if (gameState.screen !== 'END') return
  // Reset entire game state and go back to attract
  gameState.round = 1
  gameState.currentPrompt = ''
  gameState.canvasFrames = []
  gameState.words = { p1: '', p2: '' }
  gameState.votes = { p1: 0, p2: 0 }
  gameState.winner = null
  resetEndScreen()
  resetAttract()
  goToScreen('ATTRACT')
}

function draw_ending() {
  draw_endScreen()
}

function draw_endScreen() {
  background(12, 10, 18)
  endAnimFrame++

  const cx = width / 2

  // Slow paint splatter background — reuse attract splatters
  noStroke()
  const bgCols = ['#E8523A','#2E7FE8','#F5C842','#3DC47E','#C042E8']
  randomSeed(42)
  for (let i = 0; i < 12; i++) {
    const c = color(random(bgCols))
    fill(red(c), green(c), blue(c), 18)
    ellipse(random(width), random(height), random(40, 140), random(40, 140))
  }
  randomSeed()

  // Drip accents at top
  noStroke()
  const dripData = [
    { x: 0.15, col: '#E8523A', len: 80 },
    { x: 0.35, col: '#F5C842', len: 55 },
    { x: 0.65, col: '#2E7FE8', len: 95 },
    { x: 0.85, col: '#3DC47E', len: 65 },
  ]
  for (const d of dripData) {
    const c = color(d.col)
    fill(red(c), green(c), blue(c), 100)
    rect(d.x * width - 5, 0, 10, d.len, 0, 0, 5, 5)
    ellipse(d.x * width, d.len, 18, 22)
  }

  // ── Title ────────────────────────────────────────────────
  const titleScale = min(endAnimFrame / 25, 1)
  push()
  translate(cx, height * 0.14)
  scale(titleScale)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.068)

  // Yellow outline
  fill('#F5C842')
  for (let dx = -5; dx <= 5; dx += 5) {
    for (let dy = -5; dy <= 5; dy += 5) {
      if (dx === 0 && dy === 0) continue
      text('thanks for playing!', dx, dy)
    }
  }
  fill(20, 20, 20, 160)
  text('thanks for playing!', 4, 5)

  // Split coral + blue
  const fullW = textWidth('thanks for playing!')
  const halfW = textWidth('thanks for ')
  const startX = -fullW / 2
  textAlign(LEFT, CENTER)
  fill('#E8523A')
  text('thanks for ', startX, 0)
  fill('#2E7FE8')
  text('playing!', startX + halfW, 0)
  pop()

  // ── Stat block ───────────────────────────────────────────
  if (endAnimFrame > 30) {
    endStatAlpha = min(endStatAlpha + 8, 255)
  }

  push()
  translate(cx, height * 0.42)

  // Card background
  const cardW = width * 0.64
  const cardH = height * 0.22
  fill(255, 255, 255, endStatAlpha * 0.12)
  noStroke()
  rect(-cardW/2, -cardH/2, cardW, cardH, 16)

  stroke(255, 255, 255, endStatAlpha * 0.25)
  strokeWeight(1.5)
  noFill()
  rect(-cardW/2, -cardH/2, cardW, cardH, 16)

  // Stat number — big
  noStroke()
  fill(255, 220, 0, endStatAlpha)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.055)
  text('SEATTLE FREEZE IS REAL. YOU ARE NOT ALONE', 0, -cardH * 0.18)

  // Stat text
  fill(255, 255, 255, endStatAlpha)
  textSize(width * 0.017)
  text('Loneliness is as harmful to your health as smoking', 0, cardH * 0.12)

  fill(255, 255, 255, endStatAlpha * 0.6)
  textSize(width * 0.013)
  text('— US Surgeon General Advisory, 2023', 0, cardH * 0.32)

  pop()

  // ── Call to action ───────────────────────────────────────
  if (endAnimFrame > 55) {
    endCtaAlpha = min(endCtaAlpha + 6, 255)
  }

  push()
  translate(cx, height * 0.68)

  // CTA pill
  const ctaW = width * 0.62
  const ctaH = height * 0.1
  fill(232, 82, 58, endCtaAlpha)
  noStroke()
  rect(-ctaW/2, -ctaH/2, ctaW, ctaH, ctaH/2)

  fill(255, 255, 255, endCtaAlpha)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.026)
  noStroke()
  text('Talk to one person you don\'t know today.', 0, 0)
  pop()

  // ── Restart button ───────────────────────────────────────
  if (endAnimFrame > 80) {
    endButtonAlpha = min(endButtonAlpha + 5, 255)
  }

  const pulse = sin(frameCount * 0.07) * 0.2 + 0.8
  push()
  const btnW = width * 0.32
  const btnH = height * 0.062
  const btnY = height * 0.86
  noFill()
  stroke(255, 255, 255, endButtonAlpha * pulse)
  strokeWeight(2)
  rect(cx - btnW/2, btnY - btnH/2, btnW, btnH, btnH/2)
  fill(255, 255, 255, endButtonAlpha * pulse)
  noStroke()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.017)
  text('PRESS TO PLAY AGAIN', cx, btnY)
  pop()
}

// DEV keys
function endKeyPressed(k) {
  if (gameState.screen !== 'END') return
  if (k === ' ') endAdvance()
}