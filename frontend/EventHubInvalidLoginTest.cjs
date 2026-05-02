const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function eventHubInvalidLoginTest() {
    let options = new chrome.Options();
    options.addArguments('--headless'); // Use headless for cleaner execution
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

        console.log("Filling login form with INVALID credentials...");
        await driver.findElement(By.id('email')).sendKeys('invalid@test.com');
        await driver.findElement(By.id('password')).sendKeys('wrongpassword123');

        console.log("Clicking login button...");
        await driver.findElement(By.id('loginBtn')).click();

        // ⏳ Wait for the error toast to appear
        console.log("Waiting for error message...");
        await driver.sleep(2000); // Wait for animation and response

        // 📸 Take Screenshot of the error
        console.log("Taking screenshot of invalid login error...");
        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync('invalid_login_error.png', screenshot, 'base64');
        console.log("Screenshot saved as 'invalid_login_error.png'");

    } catch (err) {
        console.error("Test Error:", err.message);
    } finally {
        await driver.quit();
        console.log("Test finished.");
    }
}

eventHubInvalidLoginTest();
