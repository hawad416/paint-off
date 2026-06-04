// sketch.js

function preload() {
  preloadAttractImages()
  preloadPromptImages()
}

function setup() {
  createCanvas(windowWidth, windowHeight)
  frameRate(60)
  initCanvases()
  initDrawingScreen()
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
  const k = key.toLowerCase()

  // DEV screen jumps
  if (window.DEV_MODE) {
    const screenMap = {
      'q':'ATTRACT', 'w':'COLOR_SETUP', 'e':'PROMPT_INPUT',
      'r':'DRAWING', 't':'VOTING', 'y':'END'
    }
    if (screenMap[k]) {
      goToScreen(screenMap[k])
      if (screenMap[k] === 'DRAWING') startDrawRound()
      if (screenMap[k] === 'PROMPT_INPUT') resetPromptInput()
      if (screenMap[k] === 'VOTING') resetVoting()
      if (screenMap[k] === 'END') resetEndScreen()
      return
    }
  }

  // Delegate to ONLY the active screen — return after each so keys don't cascade
  const screen = gameState.screen
  if (screen === 'ATTRACT')      { attractKeyPressed(k);     return }
  if (screen === 'COLOR_SETUP')  { colorSetupKeyPressed(k);  return }
  if (screen === 'PROMPT_INPUT') { promptKeyPressed(k);      return }
  if (screen === 'DRAWING')      { drawingKeyPressed(k);     return }
  if (screen === 'VOTING')       { votingKeyPressed(k);      return }
  if (screen === 'END')          { endKeyPressed(k);         return }
}