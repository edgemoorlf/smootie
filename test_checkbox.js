const puppeteer = require('puppeteer');

(async () => {
    console.log('🧪 Testing conversation mode checkbox...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Listen to console logs from the page
    page.on('console', msg => {
        const text = msg.text();
        console.log('📋 Browser log:', text);
    });

    try {
        // Disable cache to ensure we get the latest JavaScript
        await page.setCacheEnabled(false);

        // Navigate to the page
        console.log('🌐 Loading http://localhost:5001...');
        await page.goto('http://localhost:5001', {
            waitUntil: 'networkidle0',
            timeout: 10000
        });

        // Wait for the checkbox to be created
        await page.waitForSelector('#conversationToggle', { timeout: 5000 });
        console.log('✅ Checkbox element found\n');

        // Check if checkbox is checked
        const isChecked = await page.evaluate(() => {
            const checkbox = document.getElementById('conversationToggle');
            return checkbox ? checkbox.checked : null;
        });

        // Get localStorage value
        const localStorageValue = await page.evaluate(() => {
            return localStorage.getItem('conversationEnabled');
        });

        // Get conversationEnabled from the controller
        const conversationEnabled = await page.evaluate(() => {
            return window.controller ? window.controller.conversationEnabled : 'controller not found';
        });

        console.log('📊 Test Results:');
        console.log('  Checkbox checked:', isChecked);
        console.log('  localStorage value:', localStorageValue);
        console.log('  controller.conversationEnabled:', conversationEnabled);
        console.log('');

        if (isChecked === true) {
            console.log('✅ SUCCESS: Checkbox is checked!');
        } else if (isChecked === false) {
            console.log('❌ FAILURE: Checkbox is NOT checked');
        } else {
            console.log('❌ ERROR: Could not determine checkbox state');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
})();
