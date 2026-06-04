// drawing/canvas.js
// Manages the split canvas, clearing, and freezing frames.

let p1Canvas, p2Canvas

function initCanvases() {
  p1Canvas = createGraphics(width / 2, height)
  p2Canvas = createGraphics(width / 2, height)
  clearCanvases()
}

function clearCanvases() {
  p1Canvas.background(245, 240, 232)
  p2Canvas.background(245, 240, 232)
}

function drawSplitCanvas() {
  image(p1Canvas, 0, 0)
  image(p2Canvas, width / 2, 0)
  stroke(200)
  strokeWeight(2)
  line(width / 2, 0, width / 2, height)
}

function freezeCurrentCanvas() {
  const snapshot = createGraphics(width, height)
  snapshot.image(p1Canvas, 0, 0)
  snapshot.image(p2Canvas, width / 2, 0)
  gameState.canvasFrames.push(snapshot)
}
