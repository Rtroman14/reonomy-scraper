const _ = require("./Helpers");
const scrapeBuildingLotTab = require("./scrape/buildingLotTab");
const scrapeOwnersTab = require("./scrape/ownersTab");
const scrapeContactsSection = require("./scrape/contactsSection");

module.exports = async (browser, url) => {
    let prospects = [];
    let state;
    let property = {};

    property.Url = url;
    property.Source = "Reonomy";

    let page;

    try {
        page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });
        await page.goto(`${url}/building`, { waitUntil: "networkidle0" });

        // * TAB: Building & Lot
        await page.waitForSelector("#property-details-section-building", { visible: true });
        await page.waitForTimeout(2000);

        await page.exposeFunction("formatAddress", _.formatAddress);
        await page.exposeFunction("delay", _.delay);

        const buildingAndLotSection = await scrapeBuildingLotTab(page);

        property = { ...property, ...buildingAndLotSection.property };
        state = buildingAndLotSection.state;

        // * TAB: Owner Tab
        await page.click("#property-details-tab-ownership");
        await page.waitForSelector(`[data-testid="owner-list-id"]`, { visible: true });

        // return array of prospects
        const owners = await scrapeOwnersTab(page);

        for (let owner of owners) {
            prospects.push({ ...property, ...owner });
        }

        // * SECTION: Contacts
        const contacts = await scrapeContactsSection(page);

        for (let contact of contacts) {
            prospects.push({ ...property, ...contact });
        }

        // * Close Tab
        await page.close();

        return prospects;
    } catch (error) {
        console.log("scrapeProperty.js() ---", error);

        await page.close();
        return false;
    }
};
