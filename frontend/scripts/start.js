const { spawn } = require('child_process');

const env = { ...process.env };

if (!env.HOST) {
  env.HOST = 'localhost';
}

if (!env.PORT) {
  env.PORT = '3000';
}

const scriptPath = require.resolve('react-scripts/scripts/start');

const child = spawn(process.execPath, [scriptPath], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
