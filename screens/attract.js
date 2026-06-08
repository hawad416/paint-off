// screens/attract.js

let attractState = 'idle'
let grayCan, redCan, blueCan
let bothReadyAt = null
let particles = []
let drips = []
let bgSplatters = []

function preloadAttractImages() {
  grayCan = loadImage('assets/gray-spray-can.svg')
  redCan = loadImage('assets/red-spray-can.svg')
  blueCan = loadImage('assets/blue-spray-can.svg')
}

function initAttract() {
  bgSplatters = []
  randomSeed(99)
  const cols = ['#E8523A','#2E7FE8','#F5C842','#3DC47E','#C042E8','#FF6B35']
  for (let i = 0; i < 18; i++) {
    bgSplatters.push({
      x: random(width), y: random(height),
      r: random(18, 70), col: random(cols),
      alpha: random(18, 48),
      blobs: Array.from({length: floor(random(4,9))}, () => ({
        ox: random(-30,30), oy: random(-30,30), r: random(8,28)
      }))
    })
  }
  drips = []
  const dripCols = ['#E8523A','#2E7FE8','#F5C842','#3DC47E']
  for (let i = 0; i < 10; i++) {
    drips.push({
      x: random(width*0.05, width*0.95), y: 0,
      len: random(40,160), w: random(4,12),
      col: random(dripCols), speed: random(0.3,1.1),
      cur: random(0,80)
    })
  }
  randomSeed()
}

function attractCanPressed(player) {
  if (attractState === 'idle' && player === 'p1') {
    attractState = 'p1ready'
    spawnBurst(width*0.26, height*0.62, '#E8523A')
  } else if (attractState === 'idle' && player === 'p2') {
    attractState = 'p2ready'
    spawnBurst(width*0.74, height*0.62, '#2E7FE8')
  } else if (attractState === 'p1ready' && player === 'p2') {
    attractState = 'bothwait'
    bothReadyAt = millis()
    spawnBurst(width*0.74, height*0.62, '#2E7FE8')
  } else if (attractState === 'p2ready' && player === 'p1') {
    attractState = 'bothwait'
    bothReadyAt = millis()
    spawnBurst(width*0.26, height*0.62, '#E8523A')
  }
}

function spawnBurst(x, y, col) {
  for (let i = 0; i < 60; i++) {
    const angle = random(TWO_PI)
    const speed = random(3,14)
    particles.push({
      x, y,
      vx: cos(angle)*speed, vy: sin(angle)*speed - random(2,5),
      col, size: random(6,26), life: 1.0,
      decay: random(0.014,0.028),
      rot: random(TWO_PI), rotV: random(-0.15,0.15)
    })
  }
}

function resetAttract() {
  attractState = 'idle'
  bothReadyAt = null
  particles = []
}

function draw_attract() {
  background(255)
  if (bgSplatters.length === 0) initAttract()

  drawBgSplatters()
  drawDrips()

  const canW = width * 0.32
  const canH = canW * 0.8
  const canCenterY = height * 0.63
  const spacing = width * 0.26
  const cx = width / 2
  const p1x = cx - spacing
  const p2x = cx + spacing
  const hoverP1 = sin(frameCount * 0.04) * 9
  const hoverP2 = sin(frameCount * 0.04 + PI) * 9

  const p1ready = attractState === 'p1ready' || attractState === 'bothwait' || attractState === 'both'
  const p2ready = attractState === 'p2ready' || attractState === 'bothwait' || attractState === 'both'

  if (attractState === 'bothwait' && millis() - bothReadyAt > 900) {
    attractState = 'both'
    setTimeout(() => { resetAttract(); goToScreen('COLOR_SETUP') }, 1800)
  }

  updateParticles()

  drawGraffitiTitle(cx, height * 0.16)

  if (attractState === 'idle') drawSubtitle(cx, height * 0.28)

  drawCanImage(p1x, canCenterY + hoverP1, canW, canH, p1ready ? redCan : grayCan, true)
  drawCanImage(p2x, canCenterY + hoverP2, canW, canH, p2ready ? blueCan : grayCan, false)

  // Nozzle tip is approx at top of SVG — 0.44 of canH above center, nudge closer
  const nozzleOffsetY = 0.42  // closer to actual nozzle
  if (!p1ready) drawNozzleLabel(p1x, canCenterY + hoverP1, canW, canH, '#E8523A', nozzleOffsetY)
  if (!p2ready) drawNozzleLabel(p2x, canCenterY + hoverP2, canW, canH, '#2E7FE8', nozzleOffsetY)

  drawPlayerTag(p1x, canCenterY + canH * 0.57, 'PLAYER 1', p1ready, '#E8523A')
  drawPlayerTag(p2x, canCenterY + canH * 0.57, 'PLAYER 2', p2ready, '#2E7FE8')

  if (attractState === 'both') {
    fill(255, 255, 255, 230)
    noStroke()
    rect(0, 0, width, height)
    const bh = height * 0.28
    const by = height / 2 - bh / 2
    fill(20); noStroke(); rect(0, by+8, width, bh)
    fill('#E8523A'); rect(0, by, width*0.5, bh)
    fill('#2E7FE8'); rect(width*0.5, by, width*0.5, bh)
    fill('#F5C842')
    textAlign(CENTER, CENTER)
    textFont('Impact, Arial Black, sans-serif')
    textStyle(BOLD)
    textSize(width * 0.1)
    for (let dx = -4; dx <= 4; dx += 4) {
      for (let dy = -4; dy <= 4; dy += 4) {
        text("LET'S GO!", width/2+dx, height/2+dy)
      }
    }
    fill(255)
    text("LET'S GO!", width/2, height/2)
  }
}

function drawBgSplatters() {
  noStroke()
  for (const s of bgSplatters) {
    const c = color(s.col)
    fill(red(c), green(c), blue(c), s.alpha)
    ellipse(s.x, s.y, s.r*2, s.r*2)
    for (const b of s.blobs) ellipse(s.x+b.ox, s.y+b.oy, b.r*2, b.r*2)
  }
}

function drawDrips() {
  noStroke()
  for (const d of drips) {
    d.cur = min(d.cur + d.speed, d.len)
    const c = color(d.col)
    fill(red(c), green(c), blue(c), 80)
    rect(d.x - d.w/2, d.y, d.w, d.cur, 0, 0, d.w/2, d.w/2)
    if (d.cur > 10) ellipse(d.x, d.y + d.cur, d.w*1.8, d.w*2.2)
  }
}

function drawGraffitiTitle(cx, y) {
  push()
  // Use Titan One from Google Fonts — chunky, bold, closest to FNF vibe
  textFont('Titan One, Impact, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.105)
  textAlign(CENTER, CENTER)

  // Step 1: thick black outer outline (largest, drawn first)
  fill(12)
  noStroke()
  const offsets = [
    [-8,-8],[-8,0],[-8,8],
    [0,-8],          [0,8],
    [8,-8], [8,0],  [8,8],
    [-12,0],[12,0],[0,-12],[0,12]
  ]
  for (const [dx, dy] of offsets) {
    text('paint-off!', cx+dx, y+dy)
  }

  // Step 2: yellow shadow offset (gives depth like FNF)
  fill('#F5C842')
  for (const [dx, dy] of [[-5,-5],[-5,5],[5,-5],[5,5]]) {
    text('paint-off!', cx+dx, y+dy)
  }
  fill('#D4A800')
  text('paint-off!', cx+6, y+7)

  // Step 3: main split color fill
  // Skew for graffiti lean
  drawingContext.save()
  drawingContext.transform(1, 0, -0.1, 1, 0, 0)
  const fullW = textWidth('paint-off!')
  const p1w = textWidth('paint-')
  const startX = (cx - fullW/2) + y * 0.1
  textAlign(LEFT, CENTER)
  fill('#E8523A')
  text('paint-', startX, y)
  fill('#2E7FE8')
  text('off!', startX + p1w, y)
  drawingContext.restore()

  // Step 4: white inner highlight line (top-left of letters)
  // Simulate with a small white offset
  fill(255, 255, 255, 120)
  drawingContext.save()
  drawingContext.transform(1, 0, -0.1, 1, 0, 0)
  textAlign(LEFT, CENTER)
  text('paint-off!', startX - 2, y - 3)
  drawingContext.restore()

  // Animated wavy underline — chunky
  const lineY = y + height * 0.085
  const lineW = fullW
  const lineStartX = cx - lineW/2
  noFill()
  strokeWeight(5)
  stroke('#E8523A')
  beginShape()
  for (let x = lineStartX; x <= lineStartX + lineW/2; x += 3) {
    const t = (x - lineStartX) / lineW
    vertex(x, lineY + sin(t * TWO_PI * 3 + frameCount * 0.07) * 5)
  }
  endShape()
  stroke('#2E7FE8')
  beginShape()
  for (let x = lineStartX + lineW/2; x <= lineStartX + lineW; x += 3) {
    const t = (x - lineStartX) / lineW
    vertex(x, lineY + sin(t * TWO_PI * 3 + frameCount * 0.07) * 5)
  }
  endShape()
  pop()
}

function drawSubtitle(cx, y) {
  push()
  const pillW = width * 0.5
  const pillH = height * 0.058
  fill(255); stroke(30); strokeWeight(2.5)
  rect(cx - pillW/2, y - pillH/2, pillW, pillH, pillH/2)
  fill(30); noStroke()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textSize(width * 0.017)
  text('GRAB A CAN  ·  SHAKE FOR COLOR  ·  SPRAY TO BEGIN', cx, y)
  pop()
}

function drawCanImage(cx, cy, w, h, img, mirrored) {
  push()
  translate(cx, cy)
  if (mirrored) scale(-1, 1)
  imageMode(CENTER)
  image(img, 0, 0, w, h)
  pop()
}

function drawNozzleLabel(canCx, canCy, canW, canH, col, nozzleOffsetY) {
  const nozzleTipX = canCx
  const nozzleTipY = canCy - canH * nozzleOffsetY

  const bob = sin(frameCount * 0.055) * 6
  const pillW = width * 0.13
  const pillH = height * 0.065
  // Bring label much closer — only height * 0.03 gap above nozzle tip
  const labelY = nozzleTipY - pillH / 2 - height * 0.03 + bob
  const labelX = nozzleTipX

  // Shadow
  fill(20); noStroke()
  rect(labelX - pillW/2 + 4, labelY - pillH/2 + 4, pillW, pillH, pillH/2)
  // Pill
  fill(255); stroke(col); strokeWeight(3)
  rect(labelX - pillW/2, labelY - pillH/2, pillW, pillH, pillH/2)

  fill(col); noStroke()
  textAlign(CENTER, CENTER)
  textFont('Impact, Arial Black, sans-serif')
  textStyle(BOLD)
  textSize(width * 0.015)
  text('SPRAY TO\nSTART', labelX, labelY)

  // Short dashed line — label is much closer now so line is short
  stroke(col); strokeWeight(2.5)
  drawDashedLine(labelX, labelY + pillH/2 + 2, nozzleTipX, nozzleTipY - 4)

  fill(col); noStroke()
  const ah = 9
  triangle(
    nozzleTipX, nozzleTipY,
    nozzleTipX - ah*0.7, nozzleTipY - ah*1.5,
    nozzleTipX + ah*0.7, nozzleTipY - ah*1.5
  )
}

function drawPlayerTag(x, y, label, ready, col) {
  push()
  const pillW = width * 0.14
  const pillH = height * 0.054
  if (ready) {
    fill(20); noStroke(); rect(x - pillW/2+4, y - pillH/2+4, pillW, pillH, 6)
    fill(col); noStroke(); rect(x - pillW/2, y - pillH/2, pillW, pillH, 6)
    fill(255); textStyle(BOLD); textSize(width*0.017)
    textFont('Impact, Arial Black, sans-serif')
    textAlign(CENTER, CENTER); noStroke()
    text('READY!', x, y)
  } else {
    fill(20); noStroke(); rect(x - pillW/2+3, y - pillH/2+3, pillW, pillH, 6)
    fill(255); stroke(col); strokeWeight(2.5); rect(x - pillW/2, y - pillH/2, pillW, pillH, 6)
    fill(30); noStroke()
    textAlign(CENTER, CENTER)
    textFont('Impact, Arial Black, sans-serif')
    textStyle(BOLD); textSize(width*0.016)
    text(label, x, y)
  }
  pop()
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx; p.y += p.vy
    p.vy += 0.22; p.vx *= 0.97
    p.life -= p.decay
    if (p.life <= 0) { particles.splice(i, 1); continue }
    const c = color(p.col)
    fill(red(c), green(c), blue(c), p.life * 230)
    noStroke()
    push()
    translate(p.x, p.y); rotate(p.rot)
    p.rot += p.rotV
    ellipse(0, 0, p.size*p.life*1.4, p.size*p.life)
    pop()
  }
}

function drawDashedLine(x1, y1, x2, y2) {
  const d = dist(x1, y1, x2, y2)
  const dashLen = 6
  const steps = floor(d / dashLen)
  for (let i = 0; i < steps; i += 2) {
    const t1 = i / steps
    const t2 = min((i+1) / steps, 1)
    line(lerp(x1,x2,t1), lerp(y1,y2,t1), lerp(x1,x2,t2), lerp(y1,y2,t2))
  }
}

function attractKeyPressed(k) {
  if (gameState.screen !== 'ATTRACT') return
  if (k === '1') attractCanPressed('p1')
  if (k === '2') attractCanPressed('p2')
}

function mousePressed() {
  initBluetooth();
}