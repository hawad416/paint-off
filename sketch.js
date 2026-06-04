// sketch.js

function preload() {
  preloadAttractImages()
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  frameRate(60)
  initCanvases()
  initSpeechInput()
  initMediaPipe()
  initBluetooth()

  // DEV
  gameState.screen = 'ATTRACT'
  window.DEV_MODE = true
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

function keyPressed() {
  // Screen jumping (DEV)
  if (window.DEV_MODE) {
    const map = { 'q':'ATTRACT','w':'COLOR_SETUP','e':'PROMPT_INPUT','r':'DRAWING','t':'VOTING','y':'END' }
    if (map[key]) { goToScreen(map[key]); return }
  }

  // Delegate to current screen
  if (gameState.screen === 'ATTRACT') attractKeyPressed()
}