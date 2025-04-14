const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const port = 3000;

// Change this to your port (e.g., 'COM3' on Windows or '/dev/ttyACM0' on Linux)
const arduinoPort = new SerialPort({
  path: '/dev/ttyACM0', // IDK WHAT IT ACTUALLY IS WITHOUT THE ARDUINO
  baudRate: 9600
});

// Set up a line-by-line parser
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

let latestData = 'Waiting for sensor data...';

// When new data comes in from Arduino
parser.on('data', (line) => {
  latestData = line.trim();
  console.log(`Received: ${latestData}`);
});

// Serve the data to the frontend
app.get('/data', (req, res) => {
  res.json({ data: latestData });
});

// Serve your index.html from the same folder
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
