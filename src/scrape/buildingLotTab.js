module.exports = async (page) => {
    return await page.evaluate(async () => {
        const getText = (doc, selector) => {
            try {
                const selected = doc.querySelector(selector);

                if (selected) {
                    return selected.innerText;
                }

                return "";
            } catch (error) {
                return "";
            }
        };

        let property = {};

        try {
            property.Address = getText(document, "p[data-test-id='header-property-address']");

            // format address
            let { propertyAddress, propertyState } = await formatAddress(property.Address);
            property = { ...property, ...propertyAddress };
            let state = propertyState;

            // building section
            let buildingSection = document.querySelector(
                "#property-details-section-building > div > div:nth-child(1) > div:nth-child(1)"
            );
            const yearBuilt = getText(buildingSection, "dl:nth-child(1) dd");
            const yearRenovated = getText(buildingSection, "dl:nth-child(2) dd");
            const squareFeet = getText(buildingSection, "dl:last-child dd span");
            property["Square Feet"] = squareFeet === "--" ? "" : squareFeet;
            property["Year Built"] = yearBuilt === "--" ? "" : yearBuilt;
            property["Year Renovated"] = yearRenovated === "--" ? "" : yearRenovated;

            // lot section
            let lotSection = document.querySelector(
                "#property-details-section-building > div > div:nth-child(1) > div:nth-child(2)"
            );
            property["Building Type"] = getText(lotSection, "dl:nth-child(1) dd");

            return { property, state };
        } catch (error) {
            console.log(error);

            return { property: {}, state: "" };
        }
    });
};
