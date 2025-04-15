#include <dht.h>
#define dataPin 11 // Defines pin number to which the sensor is connected
dht DHT; // Creats a DHT object

void setup() 
{
	Serial.begin(9600);
}

void loop() {
	int readData = DHT.read22(dataPin); // Use DHT22/AM2302
  
	if (readData == DHTLIB_OK) {
	  float t = DHT.temperature;
	  float h = DHT.humidity;
  
	  // Print temperature as JSON
	  Serial.print("{\"type\":\"temperature\",\"value\":");
	  Serial.print(t, 1); // 1 decimal precision
	  Serial.println("}");
  
	  // Print humidity as JSON
	  Serial.print("{\"type\":\"humidity\",\"value\":");
	  Serial.print(h, 1);
	  Serial.println("}");
	} else {
	  Serial.println("{\"error\": \"DHT sensor read failed\"}");
	}
  
	delay(2000);
  }
