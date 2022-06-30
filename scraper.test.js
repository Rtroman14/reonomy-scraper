const pLimit = require("p-limit");
const puppeteer = require("puppeteer");
// const { getText } = require("./src/Helpers");
// import pLimit from "p-limit";

const _ = require("./src/Helpers");

// const getText = async (doc, selector) => {
//     const selected = await doc.querySelector(selector);

//     if (selected) {
//         return await selected.innerText;
//     }

//     return "";
// };

const NUM_TABS = 3;

const limit = pLimit(NUM_TABS);

const scrapePage = async (browser, url) => {
    const page = await browser.newPage();
    // document.querySelector("h1").innerText

    await page.goto(url, { waitUntil: "networkidle0" });
    // await page.exposeFunction("getText", getText);

    await page.waitForSelector("h1");

    try {
        const title = await page.evaluate(async () => {
            const getText = async (doc, selector) => {
                const selected = await doc.querySelector(selector);

                if (selected) {
                    return await selected.innerText;
                }

                return "";
            };

            const title = await getText(document, "h1");

            return title;
        });

        await page.close();

        return title;
    } catch (error) {
        console.log(error);
        return "error";
    }
};

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
        );

        let website = "https://dev.to/";

        await page.goto(website, { waitUntil: "networkidle0" });

        // login
        await page.waitForSelector(`.crayons-footer`, { visible: true });

        let propertyURLs = await page.evaluate(() =>
            Array.from(
                document.querySelectorAll(
                    `#substories > .crayons-story .crayons-story__hidden-navigation-link`
                ),
                (e) => e.href
            )
        );

        // Create an array of our promises using map (fetchData() returns a promise)
        let promises = propertyURLs.map((url) => limit(() => scrapePage(browser, url)));

        const result = await Promise.all(promises);
        console.log(result);

        // close browser
        // await browser.close();
        // console.log("Browser closed");
    } catch (error) {
        // close browser
        // await browser.close();
        console.log(`INDEX.JS ERROR --- ${error}`);
    }
})();
