const fetch = require("node-fetch");

class Reonomy {
    propertyIDs = async (headers, body, offset) => {
        const res = await fetch(
            `https://api.reonomy.com/v2/search/pins?offset=${offset}&limit=1000`,
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
            body: `{"ids":${ids}}`,
        });

        const data = await res.json();
        return data;
    };
}

module.exports = new Reonomy();
