// controllers/mediapipe.js
// Owns webcam + MediaPipe hand tracking.
// Exposes: cursor positions for P1/P2, audience hand count.
// Isaac owns this file.

function initMediaPipe() {
  // TODO: initialize MediaPipe Hands + webcam
  // On each frame, update gameState.cursor.p1 and gameState.cursor.p2
  // with normalized (0–1) x/y positions of each player's index finger
  // P1 = left half of frame, P2 = right half
}

function getAudienceHandCount() {
  // TODO: return count of raised hands detected in frame
  return 0
}
