let celsius = true;
let activeChart = null;
let chart;
let dataLog = {
    temp: [],
    humidity: [],
    air: [],
    noise: []
};

let startTime = Date.now();

// Modal Opening Logic
function openModal(metricType) {
    document.getElementById('modal').style.display = 'block';
    activeChart = metricType;
    initChart(metricType);
}

// Modal Closing Logic
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    activeChart = null;
}

// Modal Chart Initialization
function initChart(metricType) {
    const context = document.getElementById('chartCanvas').getContext('2d');

    if (chart) {
        chart.destroy();
    }
    
    let yAxisConfig = {
        beginAtZero: true,
        title: { display: true, text: 'Value' }
    };

    if (metricType === 'temp') {
        yAxisConfig = {
            min: 0,
            max: 120,
            title: { display: true, text: 'Temperature (°F)' }
        };
    } else if (metricType === 'humidity') {
        yAxisConfig = {
            min: 0,
            max: 100,
            title: { display: true, text: 'Humidity (%)' }
        };
    } else if (metricType === 'air') {
        yAxisConfig = {
            min: 0,
            max: 500,
            title: { display: true, text: 'Air Quality (AQI)' }
        };
    } else if (metricType === 'noise') {
        yAxisConfig = {
            min: 0,
            max: 120,
            title: { display: true, text: 'Noise Level (dB)' }
        };
    }

    // Create chart
    chart = new Chart(context, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
                borderColor: '#0a75ff',
                fill: true,
                backgroundColor: 'rgba(100, 200, 250, 0.3)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: yAxisConfig,
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const timeInSeconds = tooltipItem.dataIndex * 60;
                            const hours = Math.floor(timeInSeconds / 3600) + 9;
                            const minutes = Math.floor((timeInSeconds % 3600) / 60);
                            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
                        }
                    }
                }
            }
        }
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Update chart with dynamic labels based on current time
function updateChart() {
    if (activeChart && chart) {
        const dataArray = dataLog[activeChart];
        const labels = [];

        // Create labels for every 10 minutes in the range (6 data points per hour, 8 hours total)
        for (let i = 0; i < 48; i++) { // 6 points per hour * 8 hours
            const timeInSeconds = i * 600; // 10-minute intervals
            const hours = Math.floor(timeInSeconds / 3600) + 9; // Start at 9 AM
            const minutes = Math.floor((timeInSeconds % 3600) / 60);
            if (i % 6 === 0) { // Only show hour labels (9AM, 10AM, etc.)
                labels.push(`${hours}:${minutes < 10 ? '0' : ''}${minutes}`);
            } else {
                labels.push(''); // Leave empty for in-between points
            }
        }

        chart.data.labels = labels;

        const chartLabels = {
            temp: 'Temperature over Time',
            humidity: 'Humidity over Time',
            air: 'Air Quality over Time',
            noise: 'Noise Level over Time'
        };
        
        chart.data.datasets[0].label = chartLabels[activeChart] || `${capitalize(activeChart)} over Time`;

        chart.data.datasets[0].data = dataArray.slice(-48); // Display the last 48 data points

        chart.update(); // Update the chart after data modification
    }
}

function logData(type, value) {
    const maxPoints = 48; 
    dataLog[type].push(value);
    if (dataLog[type].length > maxPoints) {
        dataLog[type].shift();
    }

    // If the chart is currently active and matches the data type, update the chart
    if (activeChart === type) {
        updateChart(); // Ensure the chart updates whenever data is logged
    }
}

// Data simulation
function simulateData() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const temp = generateTemperature(elapsedTime); 
    const humidity = generateHumidity();
    const air = generateAirQuality();
    const noise = generateNoiseLevel();

    // Update the UI with the new data
    updateData(temp, humidity, air, noise);

    // Log the data for each metric
    logData('temp', temp);
    logData('humidity', humidity);
    logData('air', air);
    logData('noise', noise);
}

//fetch data
async function fetchDataFromServer() {
    const response = await fetch('/data');
    const json = await response.json();

    const temp = json.temperature;
    const humidity = json.humidity;
    const air = json.airQuality;
    const noise = json.noise;

    // Update UI
    updateData(temp, humidity, air, noise);

    // Log to chart
    logData('temp', temp);
    logData('humidity', humidity);
    logData('air', air);
    logData('noise', noise);

    document.getElementById('airQuality').innerText = `${airValue} AQI`;
    // optionally update other UI elements

    logData('air', airValue); // to feed into chart
}

function updateData(temp, humidity, air, noise) {
    document.getElementById('temperature').innerText = `${temp} °${celsius ? 'C' : 'F'}`;
    document.getElementById('humidity').innerText = `${humidity} %`;
    document.getElementById('airQuality').innerText = `${air} AQI`;
    document.getElementById('noiseLevel').innerText = `${noise} dB`;

    // Change card colors based on the values
    changeCardColors(temp, humidity, air);
}

function generateTemperature(elapsedTime) {
    const baseTemp = 22 + Math.sin(elapsedTime / (24 * 3600)) * 8; // Base temperature with sinusoidal changes
    const randomChange = (Math.random() * 5 - 2.5); // Random change in temperature (-2.5 to 2.5 °C)
    const finalTemp = baseTemp + randomChange;
    return celsius ? finalTemp.toFixed(1) : ((finalTemp * 9 / 5) + 32).toFixed(1); // Rounded temp for display
}

function generateHumidity() {
    return (Math.random() * 20 + 40).toFixed(1); // Simulate humidity between 40% and 60%
}

function generateAirQuality() {
    return Math.floor(Math.random() * 50 + 20); // Simulate AQI between 20 (good) and 70 (moderate)
}

function generateNoiseLevel() {
    return Math.floor(Math.random() * 30 + 40); // Simulate noise level between 40 and 70 dB
}

// Change card colors based on the values
function changeCardColors(temp, humidity, air) {
    // Temperature card: Color changes from blue (cold) to red (hot)
    const tempCard = document.querySelector('.card:nth-child(1)');
    if (temp > 70) { // 70°F is approximately 21°C
        tempCard.style.background = `linear-gradient(to right, #FF4500, #FF6347)`; 
    } else {
        tempCard.style.background = `linear-gradient(to right, #4B9CD3, #00BFFF)`;
    }
    // Air Quality card: Color changes from red (bad) to green (good)
    const airCard = document.querySelector('.card:nth-child(3)');
    const green = Math.min(air / 150, 1) * 255;
    const red = Math.max(255 - (air / 150) * 255, 0);
    airCard.style.background = `rgb(${red}, ${green}, 0)`; // red to green gradient
}

setInterval(fetchDataFromServer, 1000); // Update every 5 seconds (should be every 10 min in final iteration)

function toggleMode() {
    document.body.classList.toggle('dark-mode');
    const tempCard = document.querySelector('.card:nth-child(1)');
    const airCard = document.querySelector('.card:nth-child(3)');

    const darkModeButton = document.querySelector('.toggle-dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        tempCard.style.color = '#fff';
        airCard.style.color = '#fff';
        darkModeButton.innerText = 'Light Mode';  // Change text on button to indicate current mode
    } else {
        tempCard.style.color = '#000';
        airCard.style.color = '#000';
        darkModeButton.innerText = 'Dark Mode';  // Change text on button to indicate current mode
    }
}

function toggleTemp() {
    celsius = !celsius;
    const tempUnitButton = document.querySelector('.toggle-temp-unit');

    // Clear the previous data and reset the chart
    dataLog.temp = [];
    dataLog.humidity = [];
    dataLog.air = [];
    dataLog.noise = [];

    // Generate new data based on the new temperature unit
    startTime = Date.now(); // Reset the start time
    //simulateData(); // Immediately simulate new data with the correct unit

    // Reinitialize the chart with the new temperature data
    updateChart();

    // Update button text based on the unit
    tempUnitButton.innerText = `Switch to ${celsius ? 'Fahrenheit' : 'Celsius'}`;
}