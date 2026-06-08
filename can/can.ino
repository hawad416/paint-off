#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <FastLED.h>
#include <Adafruit_ADXL343.h>

#define LED_PIN A0
#define VIBRO A1
#define BUTTON A4

#define SHAKE_THRESH 20
#define VIBRO_LENGTH 100
#define NUM_LEDS 8

#define CAN_ID 1

// Networking stuff (Nordic UART Service UUIDs)
#define SERVICE_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHAR_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"  // Device → ESP32
#define CHAR_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"  // ESP32 → Device

// More networking
BLEServer *pServer = nullptr;
BLECharacteristic *pTxCharacteristic = nullptr;
bool deviceConnected = false;

Adafruit_ADXL343 accel = Adafruit_ADXL343(12345);

const CRGB colors[8] = {0xE07C5A, 0xE0C45A, 0x5AE07C, 0x5A9CE0, 0xC45AE0, 0xE05A7C, 0x5AE0D8, 0x111111};

// Define the array of leds
CRGB leds[NUM_LEDS];

bool prev_button = false;
uint32_t t_vibro = 0;
uint8_t color_index = 0;

// Networking helper
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) {
    deviceConnected = true;
    Serial.println("Client connected");
  }
  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;
    Serial.println("Client disconnected");
    // Restart advertising so it can reconnect
    pServer->startAdvertising();
  }
};

// Bluetooth callback - when we receive a message
class RxCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    String rxValue = pCharacteristic->getValue();
    if (rxValue.length() > 0) {
      rxValue.trim();
      color_index = atoi(rxValue.c_str());

      Serial.print("Received: ");
      Serial.println(color_index);

      // Only thing receiving so far is the color index
      for (int i = 0; i < NUM_LEDS; i++) {
        leds[i] = colors[color_index];
      }
      FastLED.show();
    }
  }
};

// Sets up the bluetooth
void networkingSetup() {
  BLEDevice::init("MyESP32-S3");

  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  // TX characteristic (ESP32 → client), notify-only
  pTxCharacteristic = pService->createCharacteristic(
    CHAR_UUID_TX,
    BLECharacteristic::PROPERTY_NOTIFY);
  pTxCharacteristic->addDescriptor(new BLE2902());

  // RX characteristic (client → ESP32), write-only
  BLECharacteristic *pRxCharacteristic = pService->createCharacteristic(
    CHAR_UUID_RX,
    BLECharacteristic::PROPERTY_WRITE
  );
  pRxCharacteristic->setCallbacks(new RxCallbacks());

  pService->start();
  pServer->startAdvertising();
  Serial.println("BLE started, waiting for connection...");
}

void setup() {
  pinMode(VIBRO, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);

  if (!accel.begin()) { while(1); }

  FastLED.addLeds<WS2812,LED_PIN,GRB>(leds,NUM_LEDS);
  FastLED.setBrightness(50);
  FastLED.show();

  Serial.begin(115200);

  networkingSetup();
}

void loop() {
  uint32_t now = millis();
  bool button = !digitalRead(BUTTON);
  sensors_event_t event;
  accel.getEvent(&event);

  // Serial.print(String(SHAKE_THRESH) + ",");

  // Serial.println(String(event.acceleration.x));
  // Serial.print(String(event.acceleration.y) + ",");
  // Serial.println(String(event.acceleration.z));

  Serial.println(button);

  if (event.acceleration.x >= SHAKE_THRESH) {
    pTxCharacteristic->setValue(String(CAN_ID) + " shaken");
    pTxCharacteristic->notify();

    digitalWrite(VIBRO, HIGH);
    t_vibro = now;
  }

  if (!prev_button && button) {
    pTxCharacteristic->setValue(String(CAN_ID) + " pressed");
    pTxCharacteristic->notify();
  } else if (prev_button && !button) {
    pTxCharacteristic->setValue(String(CAN_ID) + " released");
    pTxCharacteristic->notify();
  }

  if ((uint32_t)(now - t_vibro) >= VIBRO_LENGTH) {
    digitalWrite(VIBRO, LOW);
  }

  prev_button = button;
  delay(50);
}
