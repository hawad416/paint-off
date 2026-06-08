// constants.js
// Edit these to tune the game without touching logic

const CONSTANTS = {
  // Timers (seconds)
  DRAW_TIME: 30,
  COLOR_SETUP_TIME: 5,   // seconds of no-shake to confirm color

  // Rounds
  TOTAL_ROUNDS: 3,

  // Color palette (shared by both players)
  PALETTE: [
    '#E07C5A', // coral
    '#E0C45A', // yellow
    '#5AE07C', // green
    '#5A9CE0', // blue
    '#C45AE0', // purple
    '#E05A7C', // pink
    '#5AE0D8', // teal
    '#111111', // black
  ],

  // Canvas
  SPLIT_X: 0.5,          // fraction of width for divider

  // Spray
  SPRAY_RADIUS: 30,
  SPRAY_DENSITY: 40,     // particles per frame while spraying

  // Shake detection (from Bluetooth/accelerometer)
  SHAKE_THRESHOLD: 2.5,  // g-force threshold

  // Voting
  VOTE_DURATION: 5000,   // ms to count hands per player

  // API
  AI_MODEL: 'claude-sonnet-4-6',

  // Bluetooth
  NUS_SERVICE_UUID: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  NUS_TX_UUID: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
  NUS_RX_UUID: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
}