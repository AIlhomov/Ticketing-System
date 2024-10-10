const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..//.env') });
const { exec, spawn } = require('child_process');

process.chdir(path.join(__dirname, '../sql')); 

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

// Run the scripts in the correct order
runScriptsInOrder();


async function runScriptsInOrder() {
    try {
        // Run Python script to generate tickets
        await runPythonScript();
        stopSpinner();
        console.log('\x1b[32m%s\x1b[0m', 'Tickets generated successfully.');

        startSpinner();
        // Reset the database
        await resetDatabase();
        stopSpinner();
        console.log('\x1b[32m%s\x1b[0m', 'Database reset successfully.');

        // Hash passwords
        await hashPasswords();
        startSpinner();
        await sleep(5000);
        

        console.log('\x1b[32m%s\x1b[0m', '\nPasswords hashed successfully.');
        stopSpinner();

        console.log('\x1b[32m%s\x1b[0m', 'Exiting...');
        await sleep(2000);
        process.exit(0);
    } catch (err) {
        stopSpinner();
        console.error(`Error: ${err.message}`);
    }
}

function resetDatabase() {
    return new Promise((resolve, reject) => {
        exec(mysqlCommand, (err, stdout, stderr) => {
            if (err) {
                reject(new Error(`Error executing SQL script: ${err.message}`));
            } else {
                resolve();
            }
        });
    });
}

function runPythonScript() {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [pythonScriptPath]);

        // Capture output from Python script
        pythonProcess.stdout.on('data', (data) => {
            console.log('\x1b[32m%s\x1b[0m', `Python script output: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python script error: ${data}`);
            reject(data);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script exited with code ${code}`));
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