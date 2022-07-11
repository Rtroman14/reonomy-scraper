require("dotenv").config();

const puppeteer = require("puppeteer");
const pLimit = require("p-limit");

const scrapeProperty = require("./src/scrapeProperty");
const writeCsv = require("./src/writeCsv");
const writeJson = require("./src/writeJson");
const moment = require("moment");

const NUM_TABS = 1;
const FILE_NAME = "";
const REONOMY_URL = "";

(async () => {
    const limit = pLimit(NUM_TABS);

    let browser;
    let allProspects = [];
    let pages = 1;
    let morePages = true;
    let pageNumber = 1;
    let time;
    let nextUrl;
    let nextPage = 2;

    try {
        browser = await puppeteer.launch({ headless: false });
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

            let url = await page.url();

            if (url.includes("page=")) {
                pageNumber = Number(url.split("page=").pop());
                nextPage = pageNumber + 1;
                nextUrl = `${url.split("page=")[0]}page=${nextPage}`;
            } else {
                nextUrl = `${url}?page=${nextPage}`;
            }

            if (nextPage <= 200) {
                await page.goto(nextUrl, { waitUntil: "networkidle0" });

                console.log("Next url:", nextUrl);
                time = moment().format("M.D.YYYY-hh:mm");

                writeJson(allProspects, `${FILE_NAME}_P=${pageNumber}_T=${time}`);

                pages++;
            } else {
                morePages = false;
                console.log("Finished scraping all pages!");
            }

            // if (pages % 5 === 0) {
            allProspects = [];
            // }
        }

        // close browser
        await browser.close();
        console.log("Browser closed");
        console.log("Left off:", url);

        time = moment().format("M.D.YYYY-hh:mm");
        writeJson(allProspects, `${FILE_NAME}_P=${pageNumber}_T=${time}`);
    } catch (error) {
        // close browser
        await browser.close();
        console.log("Browser closed");

        console.log(`ERROR --- reonomy() --- ${error}`);

        time = moment().format("M.D.YYYY-hh:mm");
        writeJson(allProspects, `${FILE_NAME}_P=${pageNumber}_T=${time}`);
    }
})();
