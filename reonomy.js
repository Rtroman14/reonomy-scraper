require("dotenv").config();

const puppeteer = require("puppeteer");
const pLimit = require("p-limit");

const scrapeProperty = require("./src/scrapeProperty");
const writeCsv = require("./src/writeCsv");

const NUM_TABS = 1;

const limit = pLimit(NUM_TABS);

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        );

        let website = "https://app.reonomy.com/!/search/70aa8671-6d2f-4964-ae1d-d47daf249c9d";

        await page.goto(website, { waitUntil: "networkidle0" });

        // login
        await page.waitForSelector(`input[name="email"]`, { visible: true });
        await page.type(`input[name="email"]`, process.env.USERNAME, { delay: 100 }); // Types slower, like a user
        await page.type(`input[name="password"]`, process.env.PASSWORD, { delay: 100 }); // Types slower, like a user
        await page.click(`button[type="submit"]`);

        let allProspects = [];
        let morePages = true;
        let pageNumber;

        while (morePages) {
            // TODO: record page number

            await page.waitForSelector(`[data-testid="summary-card"]`, { visible: true });

            let propertyURLs = await page.evaluate(() =>
                Array.from(
                    document.querySelectorAll(`[data-testid="summary-card"] a`),
                    (e) => e.href
                )
            );

            let promises = propertyURLs
                .slice(0, 2)
                .map((url) => limit(() => scrapeProperty(browser, url)));

            const prospects = await Promise.all(promises);
            allProspects = [...allProspects, ...prospects];

            morePages = false;

            // TODO: if next page && propertyURLs.length === 0, next page ...
            // TODO: else: export csv, update AT
        }

        // close browser
        await browser.close();
        console.log("Browser closed");

        writeCsv(allProspects, "allProspects");
    } catch (error) {
        // close browser
        await browser.close();
        console.log(`reonomy() --- ${error}`);

        writeCsv(allProspects, "allProspects");
    }
})();
