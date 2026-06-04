// constants.js
// Edit these to tune the game without touching logic

const CONSTANTS = {
  // Timers (seconds)
  DRAW_TIME: 60,
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
    '#FFFFFF', // white
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
  AI_MODEL: 'claude-sonnet-4-20250514',
}
