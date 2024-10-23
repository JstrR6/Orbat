const { spawn } = require('child_process');
const path = require('path');

// Function to start a process
function startProcess(command, args, name) {
    const process = spawn(command, args, {
        stdio: 'pipe',
        shell: true
    });

    process.stdout.on('data', (data) => {
        console.log(`[${name}] ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`[${name}] Error: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`[${name}] Process exited with code ${code}`);
    });

    return process;
}

// Start server first
console.log('Starting server...');
const server = startProcess('node', ['server.js'], 'Server');

// Wait 2 seconds then start bot
setTimeout(() => {
    console.log('Starting bot...');
    const bot = startProcess('node', ['bot.js'], 'Bot');
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.kill();
    bot.kill();
    process.exit(0);
});
