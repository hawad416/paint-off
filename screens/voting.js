// screens/voting.js
//
// States:
//   'showcase'   — show all 3 drawings per player, press button to start voting
//   'votep1'     — "raise your hand for P1", MediaPipe counts, press button to advance
//   'votep2'     — "raise your hand for P2", MediaPipe counts, press button to advance
//   'winner'     — show winner, press button to go to end screen

let votingState = 'showcase'
let votes = { p1: 0, p2: 0 }
let handCountDisplay = 0
let winnerPlayer = null
let winnerAnimFrame = 0
let showcaseScale = 0

function resetVoting() {
  votingState = 'showcase'
  votes = { p1: 0, p2: 0 }
  handCountDisplay = 0
  winnerPlayer = null
  winnerAnimFrame = 0
  showcaseScale = 0
}

// Called from bluetooth.js or DEV key — advances voting state
function votingAdvance() {
  if (votingState === 'showcase') {
    votingState = 'votep1'
  } else if (votingState === 'votep1') {
    votes.p1 = getAudienceHandCount()
    votingState = 'votep2'
  } else if (votingState === 'votep2') {
    votes.p2 = getAudienceHandCount()
    votingState = 'winner'
    winnerPlayer = votes.p1 > votes.p2 ? 'p1'
                 : votes.p2 > votes.p1 ? 'p2'
                 : 'tie'
    winnerAnimFrame = 0
  } else if (votingState === 'winner') {
    resetVoting()
    goToScreen('END')
  }
}

// Manual override — declare winner without MediaPipe
function votingDeclare(player) {
  if (votingState === 'votep1' || votingState === 'votep2') {
    winnerPlayer = player
    votingState = 'winner'
    winnerAnimFrame = 0
  }
}

function draw_voting() {
  background(248, 246, 240)

  if (votingState === 'showcase') drawShowcase()
  else if (votingState === 'votep1') drawVoteFor('p1')
  else if (votingState === 'votep2') drawVoteFor('p2')
  else if (votingState === 'winner') drawWinner()
}

// ── Showcase ──────────────────────────────────────────────

function drawShowcase() {
  showcaseScale = lerp(showcaseScale, 1, 0.07)

  const cx = width / 2
  const p1col = '#E8523A'
  const p2col = '#2E7FE8'

  // Title
  drawVotingTitle('LOOK WHAT YOU MADE!', cx, height * 0.1)

  // Two columns — P1 left, P2 right
  const colW = width * 0.44
  const colX = { p1: width * 0.24, p2: width * 0.76 }
  const thumbH = height * 0.22
  const thumbW = colW * 0.88
  const startY = height * 0.22

  // Column headers
  for (const [player, col] of [['p1', p1col], ['p2', p2col]]) {
    const x = colX[player]
    push()
    // Player pill
    const pillW = width * 0.12
    const pillH = height * 0.055
    fill(col)
    noStroke()
    rect(x - pillW/2, startY - pillH - 12, pillW, pillH, pillH/2)
    fill(255)
    textAlign(CENTER, CENTER)
    textFont('Impact, Arial Black, sans-serif')
    textStyle(BOLD)
    textSize(width * 0.018)
    text(player === 'p1' ? 'PLAYER 1' : 'PLAYER 2', x, startY - pillH/2 - 12)
    pop()

    // 3 drawing thumbnails stacked
    for (let r = 0; r < 3; r++) {
      const thumbY = startY + r * (thumbH + 12)
      const frame = gameState.canvasFrames[r]

      push()
      translate(colX[player], thumbY + thumbH/2)
      scale(showcaseScale)

      // Shadow
      fill(0, 0, 0, 30)
      noStroke()
      rect(-thumbW/2 + 4, -thumbH/2 + 4, thumbW, thumbH, 10)

      // Frame border
      fill(255)
      stroke(col)
      strokeWeight(3)
      rect(-thumbW/2, -thumbH/2, thumbW, thumbH, 10)

      // Drawing content
      if (frame) {
        // Clip to the player's half of the snapshot
        drawingContext.save()
        drawingContext.beginPath()
        drawingContext.rect(-thumbW/2, -thumbH/2, thumbW, thumbH)
        drawingContext.clip()

        const srcX = player === 'p1' ? 0 : frame.width / 2
        const srcW = frame.width / 2
        drawingContext.drawImage(
          frame.canvas || frame.elt || frame,
          srcX, 0, srcW, frame.height,
          -thumbW/2, -thumbH/2, thumbW, thumbH
        )
        drawingContext.restore()
      }

      // Round label
      noStroke()
      fill(0, 0, 0, 120)
      rect(-thumbW/2, thumbH/2 - 22, thumbW, 22, 0, 0, 10, 10)
      fill(255)
      textAlign(CENTER, CENTER)
      textFont('Impact, Arial Black, sans-serif')
      textSize(width * 0.012)
      text(`ROUND ${r + 1}`, 0, thumbH/2 - 11)

      pop()
    }
  }

  // Divider
  stroke(200)
  strokeWeight(1.5)
  setLineDash([8, 6])
  line(width/2, height * 0.16, width/2, height * 0.9)
  setLineDash([])

  // Bottom CTA
  drawBottomCTA('PRESS BUTTON TO START VOTING', cx)
}

// ── Vote for player ───────────────────────────────────────

function drawVoteFor(player) {
  const col = player === 'p1' ? '#E8523A' : '#2E7FE8'
  const label = player === 'p1' ? 'PLAYER 1' : 'PLAYER 2'
  const cx = width / 2

  // Big color wash
  noStroke()
  fill(red(color(col)), green(color(col)), blue(color(col)), 22)
  rect(0, 0, width, height)

  drawVotingTitle(`RAISE YOUR HAND FOR ${label}!`, cx, height * 0.12)

  // Live hand count — big and central
  const count = getAudienceHandCount()
  handCountDisplay = lerp(handCountDisplay, count, 0.2)

  push()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  noStroke()

  // Number
  textSize(width * 0.18)
  // Outline
  fill(255)
  for (let dx = -6; dx <= 6; dx += 6) {
    for (let dy = -6; dy <= 6; dy += 6) {
      if (dx === 0 && dy === 0) continue
      text(floor(handCountDisplay), cx + dx, height * 0.5 + dy)
    }
  }
  fill(col)
  text(floor(handCountDisplay), cx, height * 0.5)

  // "hands" label
  textSize(width * 0.028)
  fill(80)
  text('HANDS UP', cx, height * 0.68)
  pop()

  // Hand raise illustration — bouncing arms
  drawHandRaiseAnim(cx, height * 0.5, col)

  drawBottomCTA('PRESS BUTTON TO LOCK IN VOTES', cx)
}

function drawHandRaiseAnim(cx, cy, col) {
  const bounce = sin(frameCount * 0.1) * 12
  push()
  // Left arm
  translate(cx - width * 0.3, cy - 20 + bounce)
  stroke(col)
  strokeWeight(6)
  noFill()
  // Simple arm up shape
  line(0, 40, 0, -30)
  line(-20, 0, 0, -30)
  line(20, 0, 0, -30)
  fill(col)
  noStroke()
  ellipse(0, -40, 28, 28)
  pop()

  push()
  // Right arm (opposite phase)
  translate(cx + width * 0.3, cy - 20 - bounce)
  stroke(col)
  strokeWeight(6)
  noFill()
  line(0, 40, 0, -30)
  line(-20, 0, 0, -30)
  line(20, 0, 0, -30)
  fill(col)
  noStroke()
  ellipse(0, -40, 28, 28)
  pop()
}

// ── Winner ────────────────────────────────────────────────

function drawWinner() {
  winnerAnimFrame++
  const cx = width / 2

  if (winnerPlayer === 'tie') {
    drawTie(cx)
  } else {
    const col = winnerPlayer === 'p1' ? '#E8523A' : '#2E7FE8'
    const label = winnerPlayer === 'p1' ? 'PLAYER 1' : 'PLAYER 2'
    const loser = winnerPlayer === 'p1' ? 'p2' : 'p1'
    const loserVotes = votes[loser]
    const winnerVotes = votes[winnerPlayer]

    // Color wash
    noStroke()
    fill(red(color(col)), green(color(col)), blue(color(col)), 30)
    rect(0, 0, width, height)

    // Confetti particles
    drawConfetti()

    // Big winner text
    push()
    textAlign(CENTER, CENTER)
    textFont('Impact, Arial Black, sans-serif')
    textStyle(BOLD)

    const scl = min(winnerAnimFrame / 20, 1)
    const bounce = winnerAnimFrame > 20 ? sin((winnerAnimFrame - 20) * 0.15) * 8 : 0

    push()
    translate(cx, height * 0.28 + bounce)
    scale(scl)

    // Outline
    textSize(width * 0.038)
    fill(255)
    for (let dx = -5; dx <= 5; dx += 5) {
      for (let dy = -5; dy <= 5; dy += 5) {
        if (dx === 0 && dy === 0) continue
        text('WINNER!', dx, dy)
      }
    }
    fill('#F5C842')
    text('WINNER!', 0, 0)
    pop()

    // Player label
    textSize(width * 0.072)
    fill(255)
    for (let dx = -6; dx <= 6; dx += 6) {
      for (let dy = -6; dy <= 6; dy += 6) {
        if (dx === 0 && dy === 0) continue
        text(label, cx + dx, height * 0.5 + dy)
      }
    }
    fill(col)
    text(label, cx, height * 0.5)
    pop()

    // Vote tally
    push()
    textAlign(CENTER, CENTER)
    textFont('Impact, Arial Black, sans-serif')
    textSize(width * 0.022)
    fill(80)
    noStroke()
    text(`${winnerVotes} vs ${loserVotes} hands`, cx, height * 0.68)
    pop()
  }

  drawBottomCTA('PRESS BUTTON TO CONTINUE', cx)
}

function drawTie(cx) {
  drawVotingTitle("IT'S A TIE!", cx, height * 0.3)
  push()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textSize(width * 0.028)
  fill(80)
  noStroke()
  text('you both win 🎨', cx, height * 0.5)
  pop()
  drawBottomCTA('PRESS BUTTON TO CONTINUE', cx)
}

// Confetti
let confettiParticles = []
function drawConfetti() {
  if (winnerAnimFrame === 1) {
    confettiParticles = []
    const cols = ['#E8523A','#2E7FE8','#F5C842','#3DC47E','#C042E8']
    for (let i = 0; i < 80; i++) {
      confettiParticles.push({
        x: random(width), y: random(-100, 0),
        vx: random(-2, 2), vy: random(2, 6),
        col: random(cols),
        size: random(8, 18),
        rot: random(TWO_PI),
        rotV: random(-0.1, 0.1)
      })
    }
  }
  for (const p of confettiParticles) {
    p.x += p.vx; p.y += p.vy
    p.rot += p.rotV
    if (p.y > height + 20) p.y = -20
    push()
    translate(p.x, p.y)
    rotate(p.rot)
    fill(p.col)
    noStroke()
    rect(-p.size/2, -p.size/4, p.size, p.size/2, 2)
    pop()
  }
}

// ── Shared helpers ────────────────────────────────────────

function drawVotingTitle(txt, cx, y) {
  push()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.038)
  fill(255)
  for (let dx = -4; dx <= 4; dx += 4) {
    for (let dy = -4; dy <= 4; dy += 4) {
      if (dx === 0 && dy === 0) continue
      text(txt, cx + dx, y + dy)
    }
  }
  fill(18)
  text(txt, cx, y)
  pop()
}

function drawBottomCTA(txt, cx) {
  const pulse = sin(frameCount * 0.07) * 0.2 + 0.8
  push()
  const pillW = width * 0.42
  const pillH = height * 0.062
  const pillY = height * 0.9
  fill(18)
  noStroke()
  rect(cx - pillW/2, pillY - pillH/2, pillW, pillH, pillH/2)
  fill(255, 255, 255, 255 * pulse)
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.017)
  noStroke()
  text(txt, cx, pillY)
  pop()
}

function setLineDash(arr) {
  drawingContext.setLineDash(arr)
}

// DEV keys
function votingKeyPressed(k) {
  if (gameState.screen !== 'VOTING') return
  if (k === ' ') { votingAdvance(); return }
  if (k === '1') { votingDeclare('p1'); return }
  if (k === '2') { votingDeclare('p2'); return }
}