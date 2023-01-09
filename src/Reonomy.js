require("dotenv").config();

const fetch = require("node-fetch");

class Reonomy {
    propertyIDs = async (headers, body, offset) => {
        const res = await fetch(
            `https://api.reonomy.com/v2/search/pins?offset=${String(offset)}&limit=1000`,
            {
                headers,
                method: "POST",
                Referer: "https://app.reonomy.com/",
                body,
            }
        );

        const data = await res.json();
        return data;
    };

    propertyStats = async (headers, propertyID) => {
        const res = await fetch(`https://api.reonomy.com/v2/property/${propertyID}/stats`, {
            headers,
            method: "GET",
            Referer: "https://app.reonomy.com/",
        });

        const data = await res.json();
        return data;
    };

    propertyContactIDs = async (headers, propertyID) => {
        const res = await fetch(`https://api.reonomy.com/v3/property-contacts/${propertyID}`, {
            headers,
            Referer: "https://app.reonomy.com/",
            method: "GET",
        });

        const data = await res.json();
        return data;
    };

    propertyContacts = async (headers, ids) => {
        const res = await fetch(`https://api.reonomy.com/v3/people/bulk`, {
            headers,
            Referer: "https://app.reonomy.com/",
            method: "POST",
            body: `{"ids":${JSON.stringify(ids)}}`,
        });

        const data = await res.json();
        return data;
    };

    login = async (page) => {
        try {
            // login
            await page.waitForSelector(`input[name="email"]`, { visible: true });
            await page.type(`input[name="email"]`, process.env.USERNAME, { delay: 100 }); // Types slower, like a user
            await page.type(`input[name="password"]`, process.env.PASSWORD, { delay: 100 }); // Types slower, like a user
            await page.click(`button[type="submit"]`);
            console.log("Logged in");

            return true;
        } catch (error) {
            console.log("Error logging in");
            return false;
        }
    };

    allPropertyIDs = async (headers, body) => {
        try {
            let propertyIDs = [];

            const fetchedPropertyIDs = await this.propertyIDs(headers, body, 0);

            if (fetchedPropertyIDs.items.length) {
                propertyIDs = [...fetchedPropertyIDs.items.map((item) => item.id)];
            }

            const iterations = Math.ceil(fetchedPropertyIDs.count / 1000);

            for (let i = 1; i <= iterations; i++) {
                let offset = i * 1000;

                const { items } = await this.propertyIDs(headers, body, offset);
                if (items.length) {
                    propertyIDs = [...propertyIDs, ...items.map((item) => item.id)];
                }
            }

            console.log("Number of property IDs fetched:", propertyIDs.length);

            return propertyIDs;
        } catch (error) {
            console.log(error);
            return [];
        }
    };

    company = async (headers, companyID) => {
        try {
            const res = await fetch(`https://api.reonomy.com/v3/companies/${companyID}`, {
                headers,
                Referer: "https://app.reonomy.com/",
                referrerPolicy: "strict-origin-when-cross-origin",
                method: "GET",
            });

            const data = await res.json();
            return data;

            // * Website = data.websites[0].url
        } catch (error) {
            return;
        }
    };
}

module.exports = new Reonomy();
