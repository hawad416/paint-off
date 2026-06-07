// screens/drawing.js
// Split canvas drawing round using MediaPipe hands
// P1 = left half of screen (right half of camera frame)
// P2 = right half of screen (left half of camera frame)

let drawP1Canvas, drawP2Canvas
let drawP1ctx, drawP2ctx
let drawPrevPoints = {}
let drawRoundTimer = 0
let drawTimerInterval = null
let drawRoundStarted = false

const DRAW_COLORS = {
  p1: () => CONSTANTS.PALETTE[gameState.colorIndex.p1],
  p2: () => CONSTANTS.PALETTE[gameState.colorIndex.p2],
}

// Call from bluetooth.js when a shake is detected
function drawingShake(player) {
  if (player === 'p1') {
    gameState.colorIndex.p1 = (gameState.colorIndex.p1 + 1) % CONSTANTS.PALETTE.length
    sendBLE(gameState.colorIndex.p1);
  } else if (player === 'p2') {
    gameState.colorIndex.p2 = (gameState.colorIndex.p2 + 1) % CONSTANTS.PALETTE.length
    sendBLE(gameState.colorIndex.p2);
  }
}

function initDrawingScreen() {
  drawP1Canvas = document.createElement('canvas')
  drawP2Canvas = document.createElement('canvas')
  drawP1Canvas.width = drawP2Canvas.width = windowWidth / 2
  drawP1Canvas.height = drawP2Canvas.height = windowHeight
  drawP1ctx = drawP1Canvas.getContext('2d')
  drawP2ctx = drawP2Canvas.getContext('2d')
  clearDrawCanvases()
}

function clearDrawCanvases() {
  drawP1ctx.fillStyle = '#f8f6f0'
  drawP1ctx.fillRect(0, 0, drawP1Canvas.width, drawP1Canvas.height)
  drawP2ctx.fillStyle = '#f8f6f0'
  drawP2ctx.fillRect(0, 0, drawP2Canvas.width, drawP2Canvas.height)
}

function startDrawRound() {
  if (!drawP1Canvas) initDrawingScreen()
  clearDrawCanvases()
  drawPrevPoints = {}
  drawRoundStarted = true
  drawRoundTimer = CONSTANTS.DRAW_TIME

  if (drawTimerInterval) clearInterval(drawTimerInterval)
  drawTimerInterval = setInterval(() => {
    drawRoundTimer--
    if (drawRoundTimer <= 0) {
      clearInterval(drawTimerInterval)
      drawTimerInterval = null
      drawRoundStarted = false
      onDrawRoundEnd()
    }
  }, 1000)
}

function onDrawRoundEnd() {
  // Freeze canvas snapshot into gameState
  const snapshot = document.createElement('canvas')
  snapshot.width = windowWidth
  snapshot.height = windowHeight
  const sctx = snapshot.getContext('2d')
  sctx.drawImage(drawP1Canvas, 0, 0)
  sctx.drawImage(drawP2Canvas, windowWidth / 2, 0)
  gameState.canvasFrames.push(snapshot)

  if (gameState.round < CONSTANTS.TOTAL_ROUNDS) {
    gameState.round++
    resetPromptInput()
    goToScreen('PROMPT_INPUT')
  } else {
    goToScreen('VOTING')
  }
}

function draw_drawing() {
  if (!drawP1Canvas) initDrawingScreen()

  background(248, 246, 240)

  // Apply hand drawing from MediaPipe each frame
  applyHandDrawingToCanvas()

  // Composite both player canvases onto screen
  drawingContext.drawImage(drawP1Canvas, 0, 0)
  drawingContext.drawImage(drawP2Canvas, width / 2, 0)

  // Divider
  stroke(200)
  strokeWeight(3)
  line(width / 2, 0, width / 2, height)

  // Prompt bar at top
  drawPromptBar()

  // Timer
  drawRoundTimer_UI()

  // Player color indicators
  drawColorIndicator(80, height - 48, 'P1', DRAW_COLORS.p1(), false)
  drawColorIndicator(width - 80, height - 48, 'P2', DRAW_COLORS.p2(), true)

  // Round label
  drawRoundLabel()
}

function applyHandDrawingToCanvas() {
  // handData comes from controllers/mediapipe.js
  if (!window.handData || window.handData.length === 0) return

  for (const hand of window.handData) {
    const indexTip = hand.landmarks[8]
    const thumbTip = hand.landmarks[4]
    if (!indexTip || !thumbTip) continue

    const rawX = indexTip.x
    const rawY = indexTip.y

    // Right half of raw camera = P1 (left side of screen, mirrored)
    const player = rawX > 0.5 ? 'p1' : 'p2'
    const col = DRAW_COLORS[player]()

    // Map to screen coords (mirrored)
    const screenX = (1 - rawX) * width
    const screenY = rawY * height

    // Map to player's local canvas
    const localX = player === 'p1' ? screenX : screenX - width / 2
    const localY = screenY

    const pctx = player === 'p1' ? drawP1ctx : drawP2ctx
    const id = hand.id

    // Open hand = paint, pinch = reposition
    const pinchDist = Math.hypot(
      (indexTip.x - thumbTip.x) * width,
      (indexTip.y - thumbTip.y) * height
    )
    const isPainting = pinchDist > 60 && drawRoundStarted

    if (isPainting && drawPrevPoints[id]) {
      drawHandSpray(pctx, localX, localY, col)

      // Smooth connecting stroke
      pctx.strokeStyle = col
      pctx.lineWidth = 16
      pctx.lineCap = 'round'
      pctx.globalAlpha = 0.15
      pctx.beginPath()
      pctx.moveTo(drawPrevPoints[id].x, drawPrevPoints[id].y)
      pctx.lineTo(localX, localY)
      pctx.stroke()
      pctx.globalAlpha = 1
    }

    drawPrevPoints[id] = { x: localX, y: localY }
  }
}

function drawHandSpray(pctx, x, y, col) {
  const radius = 28
  const density = 35
  pctx.fillStyle = col
  for (let i = 0; i < density; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * radius
    const px = x + Math.cos(angle) * r
    const py = y + Math.sin(angle) * r
    const size = Math.random() * 4 + 1
    pctx.globalAlpha = Math.random() * 0.55 + 0.2
    pctx.beginPath()
    pctx.arc(px, py, size, 0, Math.PI * 2)
    pctx.fill()
  }
  pctx.globalAlpha = 1
}

function drawPromptBar() {
  // Dark bar at top
  noStroke()
  fill(18, 18, 18, 220)
  rect(0, 0, width, height * 0.09)

  // Prompt text
  fill(255)
  noStroke()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.022)
  const prompt = gameState.currentPrompt || 'Waiting for prompt...'
  text(prompt, width / 2, height * 0.045)
}

function drawRoundTimer_UI() {
  const t = drawRoundTimer
  const isUrgent = t <= 10

  // Timer pill — top right
  const pillW = width * 0.08
  const pillH = height * 0.055
  const pillX = width - pillW - 20
  const pillY = height * 0.1 + 10

  noStroke()
  fill(isUrgent ? '#E8523A' : 18)
  rect(pillX, pillY, pillW, pillH, pillH / 2)

  fill(255)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.025)
  text(t + 's', pillX + pillW / 2, pillY + pillH / 2)
}

function drawColorIndicator(x, y, label, col, flip) {
  push()
  translate(x, y)

  // Color dot
  noStroke()
  fill(col)
  ellipse(0, 0, 28, 28)

  // Label
  fill(40)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.013)
  noStroke()
  text(label, 0, 22)
  pop()
}

function drawRoundLabel() {
  // Top left
  noStroke()
  fill(18, 18, 18, 200)
  const pillW = width * 0.1
  const pillH = height * 0.055
  rect(16, height * 0.1 + 10, pillW, pillH, pillH / 2)

  fill(255)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.018)
  text(`ROUND ${gameState.round}`, 16 + pillW / 2, height * 0.1 + 10 + pillH / 2)
}

// DEV keyboard
function drawingKeyPressed(k) {
  if (gameState.screen !== 'DRAWING') return
  if (k === ' ') {
    if (!drawRoundStarted) startDrawRound()
  }
  if (k === 'enter') onDrawRoundEnd()
}