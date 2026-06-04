const NUS_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_TX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_RX_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

let bleDevice = null;
let rxChar = null;

function mousePressed() {
  connectBLE();
}

function onBLEMessage(value) {
  data = value.split(",");

  let button = data.length > 3 && parseInt(data[3]);

  let ax = parseFloat(data[0]);
  let ay = parseFloat(data[1]);
  let az = parseFloat(data[2]);

  console.log(ax, ay, az, button);
}

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
  
async function connectBLE() {
  // Already connected, do nothing
  if (bleDevice && bleDevice.gatt.connected) return;

  if (!bleDevice || bleDevice.gatt.connected) {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: "MyESP32-S3" }],
      optionalServices: [NUS_SERVICE_UUID],
    });
  }

  const server = await bleDevice.gatt.connect();
  const service = await server.getPrimaryService(NUS_SERVICE_UUID);

  rxChar = await service.getCharacteristic(NUS_RX_UUID);

  const txChar = await service.getCharacteristic(NUS_TX_UUID);
  await txChar.startNotifications();
  txChar.addEventListener("characteristicvaluechanged", (e) => {
    onBLEMessage(new TextDecoder().decode(e.target.value));
  });

  console.log("Connected");
}
