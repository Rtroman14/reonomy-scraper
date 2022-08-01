require("dotenv").config();

const puppeteer = require("puppeteer");
const axios = require("axios");

const writeJson = require("./src/writeJson");
const moment = require("moment");
const Airtable = require("./src/Airtable");
const Reonomy = require("./src/Reonomy");
const _ = require("./src/Helpers");
const fetchPropertyData = require("./src/fetchPropertyData");

const { BASE_ID, RECORD_ID, TOTAL_PROPERTIES } = require("./config");

let browser;
let propertyIDs;
let allProperties = [];
let lastProperty;

(async () => {
    try {
        const territoryRecord = await Airtable.getRecord(BASE_ID, RECORD_ID);

        if (!("Territory Url" in territoryRecord)) {
            await browser.close();
            throw new Error("'Territory Url' in AT not found.");
        }
        if (!("Location" in territoryRecord)) {
            await browser.close();
            throw new Error("'Location' in AT not found.");
        }
        if (territoryRecord.Status === "Completed") {
            await browser.close();
            throw new Error("This location has already been scraped!");
        }

        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await _.configBrowser(page);

        await page.goto(territoryRecord["Territory Url"], { waitUntil: "networkidle0" });

        const isLoggedIn = await Reonomy.login(page);
        if (!isLoggedIn) {
            // close browser
            await browser.close();
            throw new Error("Browser closed");
        }

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
        await page.goto(territoryRecord["Territory Url"], { waitUntil: "networkidle0" });
        await page.waitForTimeout(15000);
        console.log("loaded");

        // * Fetch all property IDs
        if (!("Property IDs" in territoryRecord) && body && headers) {
            propertyIDs = await Reonomy.allPropertyIDs(headers, body);
            if (propertyIDs.length) {
                console.log(
                    `IMPORTANT! --> upload "Propety IDs - ${territoryRecord.Location}.json" to Airtable > Reonomy > Property IDs cell`
                );
                writeJson(propertyIDs, `Property IDs - ${territoryRecord.Location}`);
            }
        }

        if ("Property IDs" in territoryRecord && body && headers) {
            const { data } = await axios.get(territoryRecord["Property IDs"][0].url);
            propertyIDs = data;
        }

        if ("Next Property ID" in territoryRecord && body && headers) {
            propertyIDs = propertyIDs.splice(
                propertyIDs.indexOf(territoryRecord["Next Property ID"]) + 1
            );
        }

        if (propertyIDs.length) {
            propertyIDs = propertyIDs.slice(0, TOTAL_PROPERTIES);

            const iterations = Math.ceil(propertyIDs.length / 5);

            for (let i = 1; i <= iterations; i++) {
                const propertyIDsBatch = propertyIDs.splice(0, 5);

                const propertyDataReq = propertyIDsBatch.map((id) =>
                    fetchPropertyData(headers, id)
                );

                const propertyDataRes = await Promise.all(propertyDataReq);

                allProperties = [...allProperties, ...propertyDataRes];

                lastProperty = propertyIDsBatch[propertyIDsBatch.length - 1];

                if (i % 10 === 0 || i === iterations) {
                    console.log("Total properties scraped:", allProperties.length);
                }

                await _.wait(1.25);
            }
        }

        const time = moment().format("M.D.YYYY-hh:mm");
        writeJson(allProperties, `${territoryRecord.Location}_T=${time}`);

        const status = lastProperty === allProperties.pop() ? "Completed" : "In Progress";

        await Airtable.updateRecord(BASE_ID, RECORD_ID, {
            Status: status,
            "Next Property ID": lastProperty,
        });
        console.log("Next Property ID:", lastProperty);

        await browser.close();
        console.log("Closed browser");
    } catch (error) {
        await browser.close();
        console.log("Browser closed");
        writeJson(allProperties, territoryRecord.Location || "Prospects");

        console.log(`ERROR - reonomy() --- ${error}`);
    }
})();
