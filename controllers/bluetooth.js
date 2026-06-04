// controllers/bluetooth.js
// Owns ESP32 Bluetooth connection for both spray cans.
// Amber owns this file.

function initBluetooth() {
  // TODO: connect to both ESP32s over Web Bluetooth API
  // On button hold: set gameState.spraying.p1 / p2 = true
  // On button release: set to false
  // On shake event: cycle gameState.colorIndex.p1 / p2
}

function updateControllers() {
  // Called every frame from sketch.js
  // Placeholder: mouse controls P1 for local testing
  gameState.cursor.p1.x = mouseX / width
  gameState.cursor.p1.y = mouseY / height
  gameState.spraying.p1 = mouseIsPressed
}
