require("dotenv").config();

const puppeteer = require("puppeteer");
const fs = require("fs").promises;

const writeJson = require("./src/writeJson");

const REONOMY_URL = "https://app.reonomy.com/!/search/4b4570eb-a6f2-4978-932c-92af3cf0df22?page=13";

(async () => {
    let browser;

    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        );

        const cookiesString = await fs.readFile("./cookies.json");
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);

        await page.goto(REONOMY_URL, { waitUntil: "networkidle0" });

        console.log("navigated");

        // close browser
        // await browser.close();
        // console.log("Browser closed");
    } catch (error) {
        // close browser
        await browser.close();
        console.log("Browser closed");

        console.log(`ERROR --- reonomy() --- ${error}`);
    }
})();
