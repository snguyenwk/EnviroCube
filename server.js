const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const port = 3000;

// Change this to your port (e.g., 'COM3' on Windows or '/dev/ttyACM0' on Linux)
const arduinoPort = new SerialPort({
  path: '/dev/tty.usbmodem11301', // IDK WHAT IT ACTUALLY IS WITHOUT THE ARDUINO
  baudRate: 9600
});

// Set up a line-by-line parser
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

let latestData = 'Waiting for sensor data...';

// When new data comes in from Arduino
parser.on('data', (line) => {
  const parts = line.trim().split(',');
  if (parts.length === 3) {
    latestData = {
      sensor: parseInt(parts[0]),
      category: parts[1],
      message: parts[2]
    };
    console.log('Parsed data:', latestData);
  } else {
    console.warn('Malformed line skipped:', line);
  }
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
