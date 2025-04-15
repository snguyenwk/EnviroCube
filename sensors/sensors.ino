#include <dht.h>
#include <math.h>

// Pins
#define DHTPIN 11
const int MQ135_PIN = A0;
const int SOUND_PIN = A5;
const int SAMPLE_WINDOW = 100;

// Sensor objects
dht DHT;

void setup() {
  Serial.begin(9600);
}

void loop() {
  // --- Temperature & Humidity ---
  int readData = DHT.read22(DHTPIN); // DHT22 sensor
  float tempC = DHT.temperature;
  float tempF = (tempC * 9.0) / 5.0 + 32.0;
  float humidity = DHT.humidity;

  String tempJson = "{\"type\":\"temperature\",\"value\":" + String(tempF, 1) + "}";
  Serial.println(tempJson);
  delay(100);

  String humJson = "{\"type\":\"humidity\",\"value\":" + String(humidity, 1) + "}";
  Serial.println(humJson);
  delay(100);

  // --- Air Quality (MQ-135) ---
  int airValue = analogRead(MQ135_PIN);
  String airCategory, airMessage;

  if (airValue <= 150) {
    airCategory = "Good";
    airMessage = "Air is fresh. Great day to be outside!";
  } else if (airValue <= 250) {
    airCategory = "Moderate";
    airMessage = "Air is okay. Sensitive groups take caution.";
  } else if (airValue <= 400) {
    airCategory = "Unhealthy";
    airMessage = "Air quality is poor. Consider staying indoors.";
  } else if (airValue <= 600) {
    airCategory = "Very Unhealthy";
    airMessage = "High pollution. Avoid outdoor activity.";
  } else {
    airCategory = "Hazardous";
    airMessage = "Severely polluted. Stay inside!";
  }

  String airJson = "{\"type\":\"airQuality\",\"value\":\"" + airCategory + " - " + airMessage + "\"}";
  Serial.println(airJson);
  delay(100);

  // --- Sound Sensor (KY-037) ---
  int signalMax = 0;
  int signalMin = 1023;
  unsigned long startMillis = millis();

  while (millis() - startMillis < SAMPLE_WINDOW) {
    int val = analogRead(SOUND_PIN);
    if (val > signalMax) signalMax = val;
    if (val < signalMin) signalMin = val;
  }

  int peakToPeak = signalMax - signalMin;
  float voltage = (peakToPeak * 5.0) / 1023.0;
  float spikeDb = voltage * 60.0;
  float calibratedDb = 127.28 * exp(0.0098 * spikeDb) - 100.0;
  float finalDb = refineEstimatedDb(calibratedDb);

  String soundJson = "{\"type\":\"noise\",\"value\":" + String(finalDb, 1) + "}";
  Serial.println(soundJson);

  delay(300); // Pause before repeating
}

float refineEstimatedDb(float calibratedDb) {
  if (calibratedDb <= 33) {
    return 25 + (calibratedDb - 25) * (33 - 25) / (33 - 25);
  }
  else if (calibratedDb <= 35.6) {
    return 33 + (calibratedDb - 33) * (50 - 33) / (35.6 - 33);
  }
  else if (calibratedDb <= 60) {
    return 50 + (calibratedDb - 35.6) * (75 - 50) / (60 - 35.6);
  }
  else if (calibratedDb <= 80) {
    return 75 + (calibratedDb - 60) * (90 - 75) / (80 - 60);
  }
  else {
    return 90 + (calibratedDb - 80) * (100 - 90) / (100 - 80);
  }
}
