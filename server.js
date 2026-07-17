const cron = require('node-cron');
const http = require('http');

cron.schedule('0 0 1 * *', async () => {
    console.log('Running month-end update...');
    try {
        const response = await fetch('http://localhost:3000/api/cron');
        const data = await response.json();
        console.log('Update result:', data);
    } catch (error) {
        console.error('Cron failed:', error);
    }
});

console.log('Cron job scheduled for 1st of each month at midnight');

// Keep process alive
setInterval(() => { }, 1000000);