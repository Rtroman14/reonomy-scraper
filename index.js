require("dotenv").config();

const puppeteer = require("puppeteer");

const scrapeProperty = require("./src/scrapeProperty");
const writeCsv = require("./src/writeCsv");
const writeJson = require("./src/writeJson");
const moment = require("moment");

const FILE_NAME = "Dorothy";
const REONOMY_URL = "https://app.reonomy.com/!/search/c9719ba2-a58c-4aeb-a3de-fd44f73c705e?page=20";

(async () => {
    let browser;
    let allProspects = [];
    let pages = 1;
    let morePages = true;
    let pageNumber = 1;
    let time;
    let nextUrl;
    let nextPage = 2;

    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });

        // robot detection incognito - console.log(navigator.userAgent);
        await page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        );

        await page.goto(REONOMY_URL, { waitUntil: "networkidle0" });

        // login
        await page.waitForSelector(`input[name="email"]`, { visible: true });
        await page.type(`input[name="email"]`, process.env.USERNAME, { delay: 100 }); // Types slower, like a user
        await page.type(`input[name="password"]`, process.env.PASSWORD, { delay: 100 }); // Types slower, like a user
        await page.click(`button[type="submit"]`);
        console.log("Logged in");

        let headers = false;
        let body = false;

        await page.setRequestInterception(true);
        page.on("request", (request) => {
            const requestUrl = request.url();

            if (requestUrl === "https://api.reonomy.com/v2/search/pins?offset=0&limit=1000") {
                headers = request.headers();
                body = request.postData();
            }

            request.continue();
        });

        await page.waitForSelector(`[data-testid="summary-card"]`, { visible: true });
        await page.goto(REONOMY_URL, { waitUntil: "networkidle0" });
        await page.waitForTimeout(15000);
        console.log("loaded");

        if (headers && body) {
            let url = await page.url();

            if (url.includes("page=")) {
                pageNumber = Number(url.split("page=").pop());
                nextPage = pageNumber + 1;
                nextUrl = `${url.split("page=")[0]}page=${nextPage}`;
            } else {
                nextUrl = `${url}?page=${nextPage}`;
            }
        }

        writeJson(allProspects, FILE_NAME);

        // close browser
        await browser.close();
        console.log("Browser closed");
    } catch (error) {
        // close browser
        await browser.close();
        console.log("Browser closed");

        writeJson(allProspects, FILE_NAME);

        console.log(`ERROR --- reonomy() --- ${error}`);
    }
})();
