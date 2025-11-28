const { spawn } = require('child_process');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
console.log(`Starting Expo web server...`);
console.log(`Local: http://localhost:19006`);
console.log(`Network: http://${localIP}:19006`);
console.log(`\nAccess from any device on your network using the Network URL`);

// Start Expo with web
const expo = spawn('npx', ['expo', 'start', '--web', '--lan'], {
  stdio: 'inherit',
  shell: true
});

expo.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
});