const puppeteer = require("puppeteer");

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
        const page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });

        // robot detection incognito - console.log(navigator.userAgent);
        page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36"
        );

        // authenticate user
        await page.setCookie({ name: "li_at", value: cookie, domain: "www.linkedin.com" });

        let website = "https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx";

        try {
            // navigate to website
            await page.goto(website, { waitUntil: "networkidle2" });
            let elementAtBottom =
                "#searchForm > section:nth-child(2) > div:nth-child(5) > div > div:nth-child(1)";
            await page.waitForSelector(elementAtBottom);
            await page.waitFor(20000);
            console.log("Page loaded...");
        } catch (error) {
            console.log("ERROR NAVIGATING TO WEBSITE ---", error);
        }

        // close browser
        await browser.close();
        console.log("Browser closed");

        res.status(200).send("Scraped Bids");
    } catch (error) {
        // close browser
        await browser.close();
        console.log(`INDEX.JS ERROR --- ${error}`);
    }
})();
