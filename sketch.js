// sketch.js
// Entry point. Runs the state machine. Keep this file small.

// DEV: uncomment to jump to a specific screen for testing
 gameState.screen = 'ATTRACT'
 gameState.currentPrompt = 'A raccoon in a business suit'
 window.DEV_MODE = true

function setup() {
  createCanvas(windowWidth, windowHeight)
  frameRate(60)
  initCanvases()
  initSpeechInput()
  initMediaPipe()
  initBluetooth()
}

function draw() {
  background(0)
  updateControllers()

  switch (gameState.screen) {
    case 'ATTRACT':       draw_attract();      break;
    case 'COLOR_SETUP':   draw_colorSetup();   break;
    case 'PROMPT_INPUT':  draw_promptInput();  break;
    case 'DRAWING':       draw_drawing();      break;
    case 'VOTING':        draw_voting();       break;
    case 'END':           draw_endScreen();    break;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

// DEV: number keys 1-6 jump between screens
function keyPressed() {
  if (!window.DEV_MODE) return
  const map = { '1':'ATTRACT','2':'COLOR_SETUP','3':'PROMPT_INPUT','4':'DRAWING','5':'VOTING','6':'END' }
  if (map[key]) goToScreen(map[key])
}
