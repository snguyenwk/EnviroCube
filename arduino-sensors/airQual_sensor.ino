int sensorPin = A0;
int sensorValue;
String airCategory;
String airMessage;

void setup() {
  Serial.begin(9600);
}

void loop() {
  // Read analog value from MQ-135
  sensorValue = analogRead(sensorPin);

  // Determine air quality category and message
  if (sensorValue <= 150) {
    airCategory = "Good";
    airMessage = "Air is fresh. Great day to be outside!";
  }
  else if (sensorValue <= 250) {
    airCategory = "Moderate";
    airMessage = "Air is okay. Sensitive groups take caution.";
  }
  else if (sensorValue <= 400) {
    airCategory = "Unhealthy";
    airMessage = "Air quality is poor. Consider staying indoors.";
  }
  else if (sensorValue <= 600) {
    airCategory = "Very Unhealthy";
    airMessage = "High pollution. Avoid outdoor activity.";
  }
  else {
    airCategory = "Hazardous";
    airMessage = "Severely polluted. Stay inside!";
  }

  // Print results
  Serial.print("Sensor Value: ");
  Serial.print(sensorValue);
  Serial.print(" | Air Quality: ");
  Serial.print(airCategory);
  Serial.print(" | Message: ");
  Serial.println(airMessage);

  delay(1000); // Wait 1 second between readings
}
