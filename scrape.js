require("dotenv").config();

const puppeteer = require("puppeteer");

const writeJson = require("./src/writeJson");

const REONOMY_URL = "https://app.reonomy.com/!/search/4b4570eb-a6f2-4978-932c-92af3cf0df22?page=13";

(async () => {
    let browser;

    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        );

        await page.goto(REONOMY_URL, { waitUntil: "networkidle0" });

        // login
        await page.waitForSelector(`input[name="email"]`, { visible: true });
        await page.type(`input[name="email"]`, process.env.USERNAME, { delay: 100 }); // Types slower, like a user
        await page.type(`input[name="password"]`, process.env.PASSWORD, { delay: 100 }); // Types slower, like a user
        await page.click(`button[type="submit"]`);
        console.log("Logged in");

        await page.waitForSelector(`[data-testid="summary-card"]`, { visible: true });
        await page.goto(REONOMY_URL, { waitUntil: "networkidle0" });

        console.log("navigated");

        await page.waitForTimeout(3000);

        const cookies = await page.cookies();
        console.log("pulled cookies");
        writeJson(cookies, "cookies");

        // close browser
        await browser.close();
        console.log("Browser closed");
    } catch (error) {
        // close browser
        await browser.close();
        console.log("Browser closed");

        console.log(`ERROR --- reonomy() --- ${error}`);
    }
})();
