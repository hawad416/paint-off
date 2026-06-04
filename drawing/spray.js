// drawing/spray.js
// Spray particle rendering.

function drawSpray(pg, x, y, col) {
  pg.noStroke()
  pg.fill(col)
  for (let i = 0; i < CONSTANTS.SPRAY_DENSITY; i++) {
    const angle = random(TWO_PI)
    const radius = random(CONSTANTS.SPRAY_RADIUS)
    const px = x + cos(angle) * radius
    const py = y + sin(angle) * radius
    pg.ellipse(px, py, random(1, 4), random(1, 4))
  }
}

function applySprayIfActive() {
  if (gameState.spraying.p1) {
    const x = gameState.cursor.p1.x * (width / 2)
    const y = gameState.cursor.p1.y * height
    drawSpray(p1Canvas, x, y, getPlayerColor('p1'))
  }
  if (gameState.spraying.p2) {
    const x = (gameState.cursor.p2.x - 0.5) * width
    const y = gameState.cursor.p2.y * height
    drawSpray(p2Canvas, x, y, getPlayerColor('p2'))
  }
}
