// controllers/bluetooth.js
// Owns ESP32 Bluetooth connection for both spray cans.
// Amber owns this file.

async function initBluetooth() {
  // Connect to both ESP32s over Web Bluetooth API

  // Already connected, do nothing
  if (gameState.bleDevice && gameState.bleDevice.gatt.connected) return;

  if (!gameState.bleDevice || gameState.bleDevice.gatt.connected) {
    gameState.bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: "MyESP32-S3" }],
      optionalServices: [CONSTANTS.NUS_SERVICE_UUID],
    });
  }

  const server = await gameState.bleDevice.gatt.connect();
  const service = await server.getPrimaryService(CONSTANTS.NUS_SERVICE_UUID);

  gameState.rxChar = await service.getCharacteristic(CONSTANTS.NUS_RX_UUID);

  const txChar = await service.getCharacteristic(NUS_TX_UUID);
  await txChar.startNotifications();
  txChar.addEventListener("characteristicvaluechanged", (e) => {
    const values = new TextDecoder().decode(e.target.value).split(" ");
    const player = "p" + parseInt(values[0]);
    if (values[1] == "shaken") {
      if (gameState.screen == "COLOR_SETUP") {
        colorSetupShake(player);
      } else if (gameState.screen == "DRAWING") {
        drawingShake(player);
      }
    } else if (values[1] == "pressed") {
      gameState.spraying[player] = true;
    } else if (values[1] == "released") {
      gameState.spraying[player] = false;
    } else {
      console.log("Unknown message: ", values);
    }
  });
}

async function sendBLE(msg) {
  if (!gameState.rxChar || !gameState.bleDevice.gatt.connected)
    return console.warn("Not connected");
  await gameState.rxChar.writeValue(new TextEncoder().encode(msg + "\n"));
}
