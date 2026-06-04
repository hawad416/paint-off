// screens/attract.js
// Hawa owns this file.
//
// States:
//   'idle'     — both cans uncolored, waiting
//   'p1ready'  — P1 sprayed, can fills with color
//   'p2ready'  — P2 sprayed, can fills with color
//   'both'     — both ready, brief pause then advance

let attractState = 'idle'
let p1Scribbles = []
let p2Scribbles = []

function attractCanPressed(player) {
  if (attractState === 'idle' && player === 'p1') {
    attractState = 'p1ready'
    p1Scribbles = makeScribbles()
  } else if (attractState === 'idle' && player === 'p2') {
    attractState = 'p2ready'
    p2Scribbles = makeScribbles()
  } else if (attractState === 'p1ready' && player === 'p2') {
    attractState = 'both'
    p2Scribbles = makeScribbles()
    setTimeout(() => { attractState = 'idle'; goToScreen('COLOR_SETUP') }, 1800)
  } else if (attractState === 'p2ready' && player === 'p1') {
    attractState = 'both'
    p1Scribbles = makeScribbles()
    setTimeout(() => { attractState = 'idle'; goToScreen('COLOR_SETUP') }, 1800)
  }
}

function makeScribbles() {
  const lines = []
  for (let i = 0; i < 28; i++) {
    lines.push([random(-1, 1), random(0, 1), random(-1, 1), random(0, 1)])
  }
  return lines
}

function resetAttract() {
  attractState = 'idle'
  p1Scribbles = []
  p2Scribbles = []
}

function draw_attract() {
  background(252, 250, 245)

  const cx = width / 2
  const canY = height * 0.38
  const spacing = width * 0.2
  const hoverOffset = sin(frameCount * 0.045) * 7

  // Title
  drawAttractTitle(cx, height * 0.14)

  // Cans
  const p1filled = attractState === 'p1ready' || attractState === 'both'
  const p2filled = attractState === 'p2ready' || attractState === 'both'

  drawRealisticCan(cx - spacing, canY, 1, p1filled ? CONSTANTS.PALETTE[gameState.colorIndex.p1] : null, p1Scribbles, hoverOffset)
  drawRealisticCan(cx + spacing, canY, 2, p2filled ? CONSTANTS.PALETTE[gameState.colorIndex.p2] : null, p2Scribbles, hoverOffset)

  // Ready labels
  const labelY = canY + height * 0.36
  if (p1filled) drawReadyBadge(cx - spacing, labelY, 'P1 Ready!', CONSTANTS.PALETTE[gameState.colorIndex.p1])
  if (p2filled) drawReadyBadge(cx + spacing, labelY, 'P2 Ready!', CONSTANTS.PALETTE[gameState.colorIndex.p2])

  // Both ready overlay
  if (attractState === 'both') {
    fill(0, 0, 0, 140)
    noStroke()
    rect(0, 0, width, height)
    fill(255)
    textAlign(CENTER, CENTER)
    textSize(width * 0.038)
    textStyle(BOLD)
    text("let's go!", width / 2, height / 2)
  }
}

function drawAttractTitle(cx, y) {
  push()
  textAlign(CENTER, CENTER)
  textStyle(BOLD)
  textSize(width * 0.072)
  fill(18)
  noStroke()
  text('paint-off!', cx, y)

  // Animated wavy underline
  const lineY = y + height * 0.072
  const lineW = width * 0.36
  const startX = cx - lineW / 2
  stroke(18)
  strokeWeight(2.5)
  noFill()
  beginShape()
  for (let x = startX; x <= startX + lineW; x += 4) {
    const t = (x - startX) / lineW
    vertex(x, lineY + sin(t * TWO_PI * 2.5 + frameCount * 0.05) * 5)
  }
  endShape()
  pop()
}

function drawRealisticCan(cx, cy, playerNum, fillColor, scribbles, hoverOffset) {
  const canW = width * 0.088
  const canH = height * 0.44
  const bodyY = cy + hoverOffset

  push()

  // ── Nozzle tip / spray head ──────────────────────────────
  const nozzleW = canW * 0.28
  const nozzleH = height * 0.028
  const nozzleTipW = canW * 0.14
  const nozzleTipH = height * 0.016
  const nozzleX = cx - nozzleW / 2
  const nozzleY = bodyY - height * 0.038

  // Actuator (the part you press)
  fill(fillColor ? lerpColor(color(fillColor), color(40), 0.5) : color(60))
  noStroke()
  rect(cx - nozzleW / 2, nozzleY, nozzleW, nozzleH, 3)

  // Tip that sticks out the side
  fill(fillColor ? lerpColor(color(fillColor), color(30), 0.6) : color(40))
  rect(cx + nozzleW / 2 - 2, nozzleY + nozzleTipH * 0.3, nozzleTipW, nozzleTipH, 2)

  // ── Can shoulder (tapered top) ────────────────────────────
  const shoulderH = canH * 0.09
  const shoulderY = bodyY - shoulderH + 2
  fill(fillColor ? lerpColor(color(fillColor), color(255), 0.18) : color(210))
  noStroke()
  beginShape()
  vertex(cx - canW * 0.32, shoulderY + shoulderH)
  vertex(cx + canW * 0.32, shoulderY + shoulderH)
  vertex(cx + canW / 2, shoulderY)
  vertex(cx - canW / 2, shoulderY)
  endShape(CLOSE)

  // ── Can body ──────────────────────────────────────────────
  const bodyH = canH * 0.82
  const bodyTopY = bodyY

  if (fillColor) {
    // Base color fill
    fill(fillColor)
    noStroke()
    rect(cx - canW / 2, bodyTopY, canW, bodyH, 0, 0, 6, 6)

    // Scribble texture inside
    const c = color(fillColor)
    stroke(red(c) * 0.65, green(c) * 0.65, blue(c) * 0.65, 170)
    strokeWeight(1.6)
    for (const [x1n, y1n, x2n, y2n] of scribbles) {
      const x1 = cx + x1n * (canW / 2 - 6)
      const y1 = bodyTopY + 6 + y1n * (bodyH - 12)
      const x2 = cx + x2n * (canW / 2 - 6)
      const y2 = bodyTopY + 6 + y2n * (bodyH - 12)
      line(x1, y1, x2, y2)
    }
    noStroke()

    // Shine highlight strip (left side)
    fill(255, 255, 255, 48)
    rect(cx - canW / 2 + 4, bodyTopY + 8, canW * 0.18, bodyH - 16, 4)

    // Darker right edge shadow
    fill(0, 0, 0, 30)
    rect(cx + canW / 2 - canW * 0.14, bodyTopY + 8, canW * 0.12, bodyH - 16, 0, 4, 4, 0)

  } else {
    // Unfilled — silver metallic can
    fill(218, 216, 210)
    noStroke()
    rect(cx - canW / 2, bodyTopY, canW, bodyH, 0, 0, 6, 6)

    // Vertical gradient bands to simulate metallic sheen
    for (let i = 0; i < 6; i++) {
      const bx = cx - canW / 2 + (canW / 6) * i
      const bw = canW / 6
      const alpha = [30, 10, 0, 8, 22, 40][i]
      fill(255, 255, 255, alpha)
      noStroke()
      rect(bx, bodyTopY, bw, bodyH)
    }

    // Player number
    fill(80)
    textAlign(CENTER, CENTER)
    textStyle(BOLD)
    textSize(canH * 0.22)
    noStroke()
    text(playerNum, cx, bodyTopY + bodyH * 0.52)
  }

  // ── Can bottom dome ───────────────────────────────────────
  fill(fillColor ? lerpColor(color(fillColor), color(0), 0.2) : color(170))
  noStroke()
  arc(cx, bodyTopY + bodyH, canW, canH * 0.08, 0, PI, CHORD)

  // ── Outline stroke over everything ───────────────────────
  noFill()
  stroke(fillColor ? lerpColor(color(fillColor), color(0), 0.35) : color(140))
  strokeWeight(1.5)
  rect(cx - canW / 2, bodyTopY, canW, bodyH, 0, 0, 6, 6)

  // ── "Spray to start" hover label (only when not ready) ───
  if (!fillColor) {
    const labelOffset = sin(frameCount * 0.045 + (playerNum === 2 ? PI : 0)) * 5
    const labelY = bodyTopY + bodyH * 0.5 + labelOffset - height * 0.07

    // Arrow pointing FROM label TO can (left side for P1, right for P2)
    const arrowDir = playerNum === 1 ? 1 : -1  // P1 label is to the left, P2 to the right
    const labelX = cx - arrowDir * (canW * 0.5 + width * 0.085)
    const arrowTipX = cx - arrowDir * (canW / 2 + 6)

    // Label pill
    const pillW = width * 0.1
    const pillH = height * 0.048
    fill(30)
    noStroke()
    rect(labelX - pillW / 2, labelY - pillH / 2, pillW, pillH, pillH / 2)

    fill(255)
    textAlign(CENTER, CENTER)
    textStyle(NORMAL)
    textSize(width * 0.014)
    noStroke()
    text('spray to\nstart', labelX, labelY)

    // Dashed arrow from pill to can edge
    stroke(30)
    strokeWeight(1.5)
    drawDashedLine(labelX + arrowDir * (pillW / 2), labelY, arrowTipX, labelY)

    // Arrowhead pointing at the can
    fill(30)
    noStroke()
    const ahSize = 6
    triangle(
      arrowTipX, labelY,
      arrowTipX - arrowDir * ahSize * 1.5, labelY - ahSize * 0.6,
      arrowTipX - arrowDir * ahSize * 1.5, labelY + ahSize * 0.6
    )
  }

  pop()
}

function drawDashedLine(x1, y1, x2, y2) {
  const d = dist(x1, y1, x2, y2)
  const dashLen = 6
  const steps = floor(d / dashLen)
  for (let i = 0; i < steps; i += 2) {
    const t1 = i / steps
    const t2 = min((i + 1) / steps, 1)
    line(
      lerp(x1, x2, t1), lerp(y1, y2, t1),
      lerp(x1, x2, t2), lerp(y1, y2, t2)
    )
  }
}

function drawReadyBadge(x, y, label, col) {
  push()
  const pillW = width * 0.12
  const pillH = height * 0.052
  fill(col)
  noStroke()
  rect(x - pillW / 2, y - pillH / 2, pillW, pillH, pillH / 2)
  fill(255)
  textAlign(CENTER, CENTER)
  textStyle(BOLD)
  textSize(width * 0.018)
  noStroke()
  text(label, x, y)
  pop()
}