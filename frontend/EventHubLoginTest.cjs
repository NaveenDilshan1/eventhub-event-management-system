const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function eventHubLoginTest() {
    let options = new chrome.Options();
    // options.addArguments('--headless'); // Disable headless to potentially see it, but we will save a file anyway
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    console.log("Initializing Chrome Driver...");
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    console.log("Driver initialized successfully!");

    try {
        console.log("Navigating to http://localhost:3000/login...");
        await driver.get('http://localhost:3000/login');

        // Wait for elements
        await driver.wait(until.elementLocated(By.id('email')), 10000);

        console.log("Filling login form...");
        await driver.findElement(By.id('email')).sendKeys('apsi@gmail.com');
        await driver.findElement(By.id('password')).sendKeys('123456789');

        // 📸 Take Screenshot of the filled form
        console.log("Taking screenshot of auto-filled form...");
        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('login_form_filled.png', screenshot, 'base64');
        console.log("Screenshot saved as 'login_form_filled.png'");

        console.log("Clicking login button...");
        await driver.findElement(By.id('loginBtn')).click();

        // Wait for URL change to dashboard
        await driver.wait(until.urlContains('dashboard'), 10000);

        let currentUrl = await driver.getCurrentUrl();

        if (currentUrl.includes('dashboard')) {
            console.log("Login Test Passed");
        } else {
            console.log("Login Test Failed");
        }
    } catch (err) {
        console.error("Test Error:", err.message);
        console.log("Login Test Failed");
    } finally {
        await driver.quit();
    }
}

eventHubLoginTest();
