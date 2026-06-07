// state.js
// Single source of truth for all game state.
// Every screen reads from and writes to this object.

const gameState = {
  // Current screen
  // Options: 'ATTRACT' | 'COLOR_SETUP' | 'PROMPT_INPUT' | 'DRAWING' | 'VOTING' | 'END'
  screen: 'ATTRACT',

  // Round tracking
  round: 1,              // 1, 2, or 3

  // Player colors (index into CONSTANTS.PALETTE)
  colorIndex: { p1: 0, p2: 3 },

  // Word inputs for Round 1 prompt
  words: { p1: '', p2: '' },

  // Current drawing prompt
  currentPrompt: '',

  // Frozen canvas snapshots from each round (p5.Graphics objects)
  canvasFrames: [],

  // Round timer (seconds remaining)
  timer: CONSTANTS.DRAW_TIME,
  timerInterval: null,

  // Bluetooth devices
  bleDevice: null,

  // BLE rx
  rxChar: null,

  // Spray state (updated by bluetooth.js)
  spraying: { p1: false, p2: false },

  // Cursor positions from MediaPipe (0–1 normalized)
  cursor: {
    p1: { x: 0.25, y: 0.5 },
    p2: { x: 0.75, y: 0.5 },
  },

  // Audience vote counts
  votes: { p1: 0, p2: 0 },

  // Winner ('p1' | 'p2' | 'tie' | null)
  winner: null,
}

// Helper: get actual hex color for a player
function getPlayerColor(player) {
  return CONSTANTS.PALETTE[gameState.colorIndex[player]]
}

// Helper: advance to next screen
function goToScreen(screen) {
  gameState.screen = screen
}

// Helper: advance round or go to voting
function nextRound() {
  if (gameState.round < CONSTANTS.TOTAL_ROUNDS) {
    gameState.round++
    gameState.timer = CONSTANTS.DRAW_TIME
    goToScreen('PROMPT_INPUT')
  } else {
    goToScreen('VOTING')
  }
}
