const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const port = 3000;

// Set up the connection to the Arduino
const arduinoPort = new SerialPort({
  path: '/dev/tty.usbmodem11301', // Replace with your Arduino's port path
  baudRate: 9600
});

// Set up a parser to read the data line by line
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// Store the latest data for each sensor type
let sensorData = {
  temperature: null,
  humidity: null,
  noise: null,
  airQuality: null
};

// Handle incoming data from Arduino
parser.on('data', (line) => {
  try {
    // Parse the incoming line from Arduino
    const json = JSON.parse(line.trim());
    const { type, value } = json;

    // Update the sensor data based on the type
    if (type && value !== undefined) {
      sensorData[type] = value;
    }
  } catch (e) {
    console.warn("Received invalid data:", line);
  }
});

// Serve the latest data to the frontend
app.get('/data', (req, res) => {
  res.json(sensorData);
});

// Serve static files (index.html, etc.)
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
