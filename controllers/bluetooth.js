// controllers/bluetooth.js
// Owns ESP32 Bluetooth connection for both spray cans.
// Amber owns this file.

async function initBluetooth() {
  // Connect to both ESP32s over Web Bluetooth API

  // Already connected, do nothing
  if (gameState.bleDevice1 && gameState.bleDevice1.gatt.connected &&
      gameState.bleDevice2 && gameState.bleDevice2.gatt.connected) return;


  if (!gameState.bleDevice1 || gameState.bleDevice1.gatt.connected) {
    gameState.bleDevice1 = await navigator.bluetooth.requestDevice({
      filters: [{ name: "MyESP32-S3" }],
      optionalServices: [CONSTANTS.NUS_SERVICE_UUID],
    });
  }

  if (!gameState.bleDevice2 || gameState.bleDevice2.gatt.connected) {
    gameState.bleDevice2 = await navigator.bluetooth.requestDevice({
      filters: [{ name: "MyESP32-S3" }],
      optionalServices: [CONSTANTS.NUS_SERVICE_UUID],
    });
  }

  const server1 = await gameState.bleDevice1.gatt.connect();
  const server2 = await gameState.bleDevice2.gatt.connect();
  const service1 = await server1.getPrimaryService(CONSTANTS.NUS_SERVICE_UUID);
  const service2 = await server2.getPrimaryService(CONSTANTS.NUS_SERVICE_UUID);

  gameState.rxChar1 = await service1.getCharacteristic(CONSTANTS.NUS_RX_UUID);
  gameState.rxChar2 = await service2.getCharacteristic(CONSTANTS.NUS_RX_UUID);

  const txChar1 = await service1.getCharacteristic(CONSTANTS.NUS_TX_UUID);
  const txChar2 = await service2.getCharacteristic(CONSTANTS.NUS_TX_UUID);
  await txChar1.startNotifications();
  await txChar2.startNotifications();

  const func = (e) => {
    const values = new TextDecoder().decode(e.target.value).split(" ");
    console.log(values);
    const player = "p" + parseInt(values[0]);
    if (values[1] === "shaken") {
      if (gameState.screen === "COLOR_SETUP") {
        colorSetupShake(player);
      } else if (gameState.screen === "DRAWING") {
        drawingShake(player);
      }
    } else if (values[1] === "pressed") {
      gameState.spraying[player] = true;
      if (gameState.screen === "ATTRACT") {
        attractCanPressed(player);
      } else if (gameState.screen === "COLOR_SETUP") {
        colorSetupPress(player);
      } else if (gameState.screen === "PROMPT_INPUT") {
        promptSpeakHeld(player);
      } else if (gameState.screen === "DRAWING") {
        if (player === "p1") {
          is1Painting = true;
        } else {
          is2Painting = true;
        }
      } else if (gameState.screen === "VOTING") {
        votingAdvance();
      } else if (gameState.screen === "END") {
        endAdvance();
      }
    } else if (values[1] === "released") {
      gameState.spraying[player] = false;
      if (gameState.screen === "DRAWING") {
        if (player === "p1") {
          is1Painting = false;
        } else {
          is2Painting = false;
        }
      }
    } else {
      console.log("Unknown message: ", values);
    }
  }

  txChar1.addEventListener("characteristicvaluechanged", func);
  txChar2.addEventListener("characteristicvaluechanged", func);
}

async function sendBLE(player, msg) {
  if (player === "p1") {
    if (!gameState.rxChar1 || !gameState.bleDevice1.gatt.connected)
      return console.warn("Not connected");
    await gameState.rxChar1.writeValue(new TextEncoder().encode(msg + "\n"));
  } else if (player === "p2") {
    if (!gameState.rxChar2 || !gameState.bleDevice2.gatt.connected)
      return console.warn("Not connected");
    await gameState.rxChar2.writeValue(new TextEncoder().encode(msg + "\n"));
  }
}
