// screens/colorSetup.js
// Split canvas. Each player shakes their can to cycle color.
// Their half floods with that color.
// Click can to confirm ready. Both confirmed → advance to PROMPT_INPUT.

let p1ColorReady = false
let p2ColorReady = false
let p1FloodAlpha = 0
let p2FloodAlpha = 0
let p1ShakeAnim = 0   // shake wobble animation counter
let p2ShakeAnim = 0

// Call from bluetooth.js when a shake is detected
function colorSetupShake(player) {
  if (player === 'p1' && !p1ColorReady) {
    gameState.colorIndex.p1 = (gameState.colorIndex.p1 + 1) % CONSTANTS.PALETTE.length
    p1ShakeAnim = 12  // frames of wobble
  } else if (player === 'p2' && !p2ColorReady) {
    gameState.colorIndex.p2 = (gameState.colorIndex.p2 + 1) % CONSTANTS.PALETTE.length
    p2ShakeAnim = 12
  }
}

// Call from bluetooth.js when can button is pressed on this screen
function colorSetupPress(player) {
  if (player === 'p1' && !p1ColorReady) p1ColorReady = true
  else if (player === 'p2' && !p2ColorReady) p2ColorReady = true

  if (p1ColorReady && p2ColorReady) {
    setTimeout(() => {
      resetColorSetup()
      goToScreen('PROMPT_INPUT')
    }, 800)
  }
}

function resetColorSetup() {
  p1ColorReady = false
  p2ColorReady = false
  p1FloodAlpha = 0
  p2FloodAlpha = 0
  p1ShakeAnim = 0
  p2ShakeAnim = 0
}

function draw_colorSetup() {
  background(255)

  const cx = width / 2
  const p1col = CONSTANTS.PALETTE[gameState.colorIndex.p1]
  const p2col = CONSTANTS.PALETTE[gameState.colorIndex.p2]

  // Animate flood alpha toward 255
  p1FloodAlpha = min(p1FloodAlpha + 18, 255)
  p2FloodAlpha = min(p2FloodAlpha + 18, 255)

  // Color flood — left half P1, right half P2
  const p1c = color(p1col)
  const p2c = color(p2col)

  noStroke()
  fill(red(p1c), green(p1c), blue(p1c), p1FloodAlpha)
  rect(0, 0, cx, height)

  fill(red(p2c), green(p2c), blue(p2c), p2FloodAlpha)
  rect(cx, 0, cx, height)

  // Divider
  stroke(255)
  strokeWeight(4)
  line(cx, 0, cx, height)

  // Title
  drawColorSetupTitle(cx)

  // Palette bar — centered
  drawPaletteBar(cx, height * 0.28)

  // Can wobble zones + instructions
  drawPlayerZone(cx * 0.5, height * 0.62, 'P1', p1col, p1ColorReady, p1ShakeAnim, false)
  drawPlayerZone(cx + cx * 0.5, height * 0.62, 'P2', p2col, p2ColorReady, p2ShakeAnim, true)

  if (p1ShakeAnim > 0) p1ShakeAnim--
  if (p2ShakeAnim > 0) p2ShakeAnim--

  // Both ready → flash message
  if (p1ColorReady && p2ColorReady) {
    fill(0, 0, 0, 160)
    noStroke()
    rect(0, 0, width, height)
    fill(255)
    textAlign(CENTER, CENTER)
    textFont('Impact, Arial Black, sans-serif')
    textStyle(BOLD)
    textSize(width * 0.065)
    text("LOCKED IN!", cx, height / 2)
    textSize(width * 0.022)
    fill(200)
    text('get ready to draw...', cx, height / 2 + height * 0.09)
  }
}

function drawColorSetupTitle(cx) {
  push()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.055)

  // Outline
  fill(255, 220, 0)
  for (let dx = -4; dx <= 4; dx += 4) {
    for (let dy = -4; dy <= 4; dy += 4) {
      if (dx===0 && dy===0) continue
      text('SHAKE TO CHANGE COLOR', cx+dx, height*0.1+dy)
    }
  }

  // Shadow
  fill(0, 0, 0, 100)
  text('SHAKE TO CHANGE COLOR', cx+4, height*0.1+5)

  // White main
  fill(20)
  text('SHAKE TO CHANGE COLOR', cx, height*0.1)

  // Sub
  textSize(width * 0.018)
  fill(20)
  text('spray your can to lock in your color', cx, height * 0.18)
  pop()
}

function drawPaletteBar(cx, y) {
  const palette = CONSTANTS.PALETTE
  const dotR = width * 0.022
  const gap = dotR * 2.8
  const totalW = palette.length * gap
  const startX = cx - totalW / 2 + gap / 2

  // Bar background
  const barW = totalW + dotR * 1.5
  const barH = dotR * 2.8
  fill(255, 255, 255, 40)
  stroke(255, 255, 255, 80)
  strokeWeight(1.5)
  rect(cx - barW/2, y - barH/2, barW, barH, barH/2)

  // Dots
  for (let i = 0; i < palette.length; i++) {
    const x = startX + i * gap
    const c = color(palette[i])
    const isP1 = i === gameState.colorIndex.p1
    const isP2 = i === gameState.colorIndex.p2

    // Shadow
    fill(0, 0, 0, 60)
    noStroke()
    ellipse(x + 2, y + 2, dotR * 2, dotR * 2)

    // Dot
    fill(c)
    noStroke()
    ellipse(x, y, dotR * 2, dotR * 2)

    // P1 indicator ring (coral)
    if (isP1) {
      noFill()
      stroke('#E8523A')
      strokeWeight(3)
      ellipse(x, y, dotR * 2 + 8, dotR * 2 + 8)
      // P1 label
      fill('#E8523A')
      noStroke()
      textAlign(CENTER, CENTER)
      textFont('Impact, Arial Black, sans-serif')
      textSize(width * 0.012)
      text('P1', x, y + dotR + 14)
    }

    // P2 indicator ring (blue)
    if (isP2) {
      noFill()
      stroke('#2E7FE8')
      strokeWeight(3)
      ellipse(x, y, dotR * 2 + (isP1 ? 16 : 8), dotR * 2 + (isP1 ? 16 : 8))
      fill('#2E7FE8')
      noStroke()
      textAlign(CENTER, CENTER)
      textFont('Impact, Arial Black, sans-serif')
      textSize(width * 0.012)
      text('P2', x, y + dotR + (isP1 ? 26 : 14))
    }
  }
}

function drawPlayerZone(x, y, label, col, isReady, shakeAnim, flip) {
  push()
  // Can wobble when shaking
  const wobble = shakeAnim > 0 ? sin(shakeAnim * 1.4) * 10 : 0
  translate(x + wobble, y)
  if (flip) scale(-1, 1)

  // Color circle behind — shows current color
  noStroke()
  fill(col)
  ellipse(0, 0, width * 0.18, width * 0.18)

  // Ready checkmark or shake icon
  fill(255)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.028)
  if (!flip) {
    text(isReady ? '✓ LOCKED' : 'SHAKE!', 0, 0)
  } else {
    push()
    scale(-1, 1)
    text(isReady ? '✓ LOCKED' : 'SHAKE!', 0, 0)
    pop()
  }

  // Player label below circle
  if (!flip) {
    fill(255)
    textSize(width * 0.016)
    text(label, 0, width * 0.115)
  } else {
    push()
    scale(-1,1)
    fill(255)
    textSize(width * 0.016)
    text(label, 0, width * 0.115)
    pop()
  }

  // Ready indicator ring
  if (isReady) {
    noFill()
    stroke(255)
    strokeWeight(4)
    ellipse(0, 0, width * 0.21, width * 0.21)
  }

  pop()
}

// DEV: keyboard testing
// z/x = P1 shake/confirm, c/v = P2 shake/confirm
function colorSetupKeyPressed(k) {
  if (gameState.screen !== 'COLOR_SETUP') return
  if (k === 'z') colorSetupShake('p1')
  if (k === 'x') colorSetupPress('p1')
  if (k === 'c') colorSetupShake('p2')
  if (k === 'v') colorSetupPress('p2')
}