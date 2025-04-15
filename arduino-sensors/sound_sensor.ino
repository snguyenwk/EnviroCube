#include <math.h>

const int AMP_PIN = A5;
const int sampleWindow = 100;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int signalMax = 0;
  int signalMin = 1023;
  unsigned long startMillis = millis();

  // Sample max and min over a 100ms window
  while (millis() - startMillis < sampleWindow) {
    int val = analogRead(AMP_PIN);
    if (val > signalMax) signalMax = val;
    if (val < signalMin) signalMin = val;
  }

  // Compute peak-to-peak and voltage
  int peakToPeak = signalMax - signalMin;
  float voltage = (peakToPeak * 5.0) / 1023.0;

  // Step 1: Convert voltage to rough dB estimate
  float spikeDb = voltage * 60.0;
  float calibratedDb = 127.28 * exp(0.0098 * spikeDb) - 100.0;

  // Step 2: Refine the calibrated dB
  float finalDb = refineEstimatedDb(calibratedDb);

  // Send just the numerical value of noise as JSON
  String jsonData = "{\"type\":\"noise\",\"value\":" + String(finalDb, 1) + "}";
  Serial.println(jsonData); // Output to serial monitor

  delay(300); // Delay for 300ms before next reading
}

// Refine final dB estimate based on tested real-world phone data
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
