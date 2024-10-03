const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..//.env') });
const { exec, spawn } = require('child_process');

// Scripts:
const hashPasswords = require('./hashPasswords');

const spinnerChars = ['|', '/', '-', '\\'];
let spinnerIndex = 0;
let spinnerInterval;

const resetSQLPath = path.join(__dirname, '../sql/resetPC.sql');
const pythonScriptPath = path.join(__dirname, './generate_tickets.py');

const mysqlCommand = `mysql -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} < ${resetSQLPath}`;

// Start the spinner animation
startSpinner();

exec(mysqlCommand, async (err, stdout, stderr) => {
    stopSpinner();  // Stop the spinner once the DB reset is done
    
    if (err) {
        console.error(`Error executing SQL script: ${err.message}`);
        return;
    }

    console.log('\x1b[32m%s\x1b[0m', 'Database reset successfully.');  // Success message in green
    
    startSpinner();
    await runJSFunctions();
    await sleep(3000);
    stopSpinner();
    console.log('\x1b[32m%s\x1b[0m', 'Done running JavaScript.');
    
    startSpinner();
    await sleep(2000);
    stopSpinner();
    
    console.log('\x1b[32m%s\x1b[0m', 'Exiting...');
    await sleep(2000);
    process.exit(0);     // Then exit
});

async function runJSFunctions() {
    console.log('Running JavaScript after resetting the database...');

    // Stop the spinner temporarily for logging
    stopSpinner(); 
    await hashPasswords();

    // Run Python script to generate tickets
    await runPythonScript();
    startSpinner();

}

function runPythonScript() {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [pythonScriptPath]);

        // Capture output from Python script
        pythonProcess.stdout.on('data', (data) => {
            console.log(`\x1b[32m%s\x1b[0m`, `Python script output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python script error: ${data}`);
            reject(data);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(`Python script exited with code ${code}`);
            } else {
                resolve();
            }
        });
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function startSpinner() {
    spinnerInterval = setInterval(() => {
        process.stdout.write(`\r${spinnerChars[spinnerIndex]}`);
        spinnerIndex = (spinnerIndex + 1) % spinnerChars.length; 
    }, 100);
}

function stopSpinner() {
    clearInterval(spinnerInterval);
    process.stdout.write('\r');
}
