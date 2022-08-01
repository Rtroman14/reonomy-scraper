require("dotenv").config();

const puppeteer = require("puppeteer");
const pLimit = require("p-limit");

const _ = require("./src/Helpers");
const scrapeProperty = require("./src/scrapeProperty");
const writeJson = require("./src/writeJson");
const moment = require("moment");

const NUM_TABS = 1;
const FILE_NAME = "Beckwith";
const REONOMY_URL = "https://app.reonomy.com/!/search/a9e79b19-28cd-408d-9679-5c035cd56887?page=2";

(async () => {
    const limit = pLimit(NUM_TABS);

    let browser;
    let allProspects = [];
    let morePages = true;
    let time;

    let metadata = {
        pageNumber: 1,
        nextPage: 2,
        nextUrl: "",
    };

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

            metadata = _.pageMetadata(url, metadata);

            if (metadata.nextPage <= 200) {
                await page.goto(metadata.nextUrl, { waitUntil: "networkidle0" });

                console.log("Next url:", metadata.nextUrl);
                time = moment().format("M.D.YYYY-hh:mm");

                writeJson(allProspects, `${FILE_NAME}_P=${metadata.pageNumber}_T=${time}`);
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
        writeJson(allProspects, `${FILE_NAME}_P=${metadata.pageNumber}_T=${time}`);
    } catch (error) {
        // close browser
        await browser.close();
        console.log("Browser closed");

        console.log(`ERROR --- reonomy() --- ${error}`);

        if (allProspects.length) {
            time = moment().format("M.D.YYYY-hh:mm");
            writeJson(allProspects, `${FILE_NAME}_P=${metadata.pageNumber}_T=${time}`);
        }
    }
})();
