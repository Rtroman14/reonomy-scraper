require("dotenv").config();

const puppeteer = require("puppeteer");
const pLimit = require("p-limit");

const scrapeProperty = require("./src/scrapeProperty");
const writeCsv = require("./src/writeCsv");
const writeJson = require("./src/writeJson");

const NUM_TABS = 1;
const FILE_NAME = "";
const REONOMY_URL = "";

const limit = pLimit(NUM_TABS);

(async () => {
    let browser;
    let allProspects = [];
    let pages = 1;

    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        );

        let website = REONOMY_URL;

        await page.goto(website, { waitUntil: "networkidle0" });

        // login
        await page.waitForSelector(`input[name="email"]`, { visible: true });
        await page.type(`input[name="email"]`, process.env.USERNAME, { delay: 100 }); // Types slower, like a user
        await page.type(`input[name="password"]`, process.env.PASSWORD, { delay: 100 }); // Types slower, like a user
        await page.click(`button[type="submit"]`);
        console.log("Logged in");

        let morePages = true;
        let pageNumber = 1;

        while (morePages) {
            await page.waitForSelector(`[data-testid="summary-card"]`, { visible: true });

            let propertyURLs = await page.evaluate(() =>
                Array.from(
                    document.querySelectorAll(`[data-testid="summary-card"] a`),
                    (e) => e.href
                )
            );

            let promises = propertyURLs.map((url) => limit(() => scrapeProperty(browser, url)));

            const prospects = await Promise.all(promises);

            if (prospects?.length) {
                prospects.forEach((prospect) => {
                    allProspects = [...allProspects, ...prospect];
                });
            }

            // Next page
            let url = await page.url();

            let nextPage = 2;
            let nextUrl;

            if (url.includes("page=")) {
                pageNumber = Number(url.split("page=").pop());
                nextPage = pageNumber + 1;
                nextUrl = `${url.split("page=")[0]}page=${nextPage}`;
            } else {
                nextUrl = `${url}?page=${nextPage}`;
            }

            if (nextPage <= 200) {
                await page.goto(nextUrl, { waitUntil: "networkidle0" });
            } else {
                morePages = false;
                console.log("Finished scraping all pages!");
            }

            // if (pages % 5 === 0) {
            console.log("Left off:", url);
            writeJson(allProspects, `${FILE_NAME}_${pages}`);
            allProspects = [];
            // }

            pages++;
        }

        // close browser
        await browser.close();
        console.log("Browser closed");
        console.log("Left off:", url);

        writeJson(allProspects, `${FILE_NAME}_DONE`);
    } catch (error) {
        // close browser
        await browser.close();
        console.log("Browser closed");

        console.log(`ERROR --- reonomy() --- ${error}`);

        writeJson(allProspects, `${FILE_NAME}_${pages}`);
    }
})();
