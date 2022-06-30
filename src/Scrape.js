const _ = require("./Helpers");

class Scrape {
    buildingAndLotTab = async (getText, document) => {
        let property = {};

        try {
            property.Address = await getText(document, "p[data-test-id='header-property-address']");

            // format address
            let { propertyAddress, propertyState } = await formatAddress(property.Address);
            property = { ...property, propertyAddress };
            let state = propertyState;

            // building section
            let buildingSection = document.querySelector(
                "#property-details-section-building > div > div:nth-child(1) > div:nth-child(1)"
            );
            const yearBuilt = await getText(buildingSection, "dl:nth-child(1) dd");
            const yearRenovated = await getText(buildingSection, "dl:nth-child(2) dd");
            const squareFeet = await getText(buildingSection, "dl:last-child dd").split(" ")[0];
            property["Square Feet"] = squareFeet === "--" ? "" : squareFeet;
            property["Year Built"] = yearBuilt === "--" ? "" : yearBuilt;
            property["Year Renovated"] = yearRenovated === "--" ? "" : yearRenovated;

            // lot section
            let lotSection = document.querySelector(
                "#property-details-section-building > div > div:nth-child(1) > div:nth-child(2)"
            );
            property["Building Type"] = await getText(lotSection, "dl:nth-child(1) dd");

            return { property, state };
        } catch (error) {
            console.log(error);
            return { property: {}, state: "" };
        }
    };

    ownersTab = async () => {
        let contacts = [];

        // * -------------- Section: Owners
        const ownersSection = document.querySelector("#property-details-section-ownership");
        const owners = ownersSection.querySelectorAll(
            "#property-details-section-ownership > section > div.MuiBox-root"
        );

        for (let owner of owners) {
            const dropdown = owner.querySelector(".MuiGrid-item:last-child button");

            if (dropdown !== null) {
                let contact = {};

                let ownerFields = owner.querySelector(".MuiDivider-root");
                let isOwnerInfoShowing = ownerFields !== null;

                if (!isOwnerInfoShowing) {
                    dropdown.click();
                    await _.delay(300);
                }

                const fullName = _.getText(owner, ".MuiGrid-item .MuiTypography-root");

                contact["Properties in Portfolio"] = _.getText(
                    owner,
                    ".MuiGrid-item:nth-child(3) p:nth-child(2) span"
                );
                contact["Portfolio Assessed Value"] = _.getText(
                    owner,
                    ".MuiGrid-item:nth-child(3) p:nth-child(4) span"
                );
                contact["Last Acquisition Date"] = _.getText(
                    owner,
                    ".MuiGrid-item:nth-child(4) p:nth-child(2)"
                );
                contact["Property Types in Portfolio"] = _.getText(
                    owner,
                    ".MuiGrid-item:nth-child(5) > div > div"
                )
                    .split("\n\n")
                    .join(", ");

                contact["Full Name"] = fullName;
                contact["First Name"] = fullName.split(" ")[0] || "";
                contact["Last Name"] = fullName.split(" ").slice(1).join(" ") || "";
                contact.Title = "Owner";
                contact["Contact Address"] = _.getText(
                    owner,
                    `[data-testid="people-contact-address-id"]`
                );

                const ownerContactInfoSections = owner.querySelectorAll(
                    ".MuiDivider-root ~ .MuiGrid-container > .MuiGrid-item"
                );

                const contactsInfo = _.contactInfo(ownerContactInfoSections);

                contactsInfo.forEach((contactInfo) => {
                    contacts.push({ ...contact, contactInfo });
                });
            }
        }

        return contacts;
    };

    contactsSection = () => {
        let contacts = [];

        // * -------------- Section: Contacts
        let contactNameSections = document.querySelectorAll(`[data-testid="contact-item"]`);
        let contactFieldsSections = document.querySelectorAll(
            `[data-testid="contact-item"]  ~ div`
        );
        const numContacts = contactNameSections.length;

        for (let i = 0; i < numContacts; i++) {
            let contact = {};

            const contactName = _.getText(contactNameSections[i], "p.MuiTypography-root");
            contact.Title = _.getText(
                contactNameSections[i],
                "p.MuiTypography-colorTextSecondary:last-child"
            );

            contact["Full Name"] = contactName;
            contact["First Name"] = contactName.split(" ")[0] || "";
            contact["Last Name"] = contactName.split(" ").slice(1).join(" ") || "";
            contact["Contact Address"] = _.getText(
                contactFieldsSections[i],
                `[data-testid="people-contact-address-id"]`
            );

            const contactInfoSections = contactFieldsSections[i].querySelectorAll(
                ".MuiBox-root > .MuiBox-root > .MuiGrid-container > div"
            );

            const contactsInfo = _.contactInfo(contactInfoSections, contact);

            contactsInfo.forEach((contactInfo) => {
                contacts.push({ ...contact, ...contactInfo });
            });
        }

        return contacts;
    };
}

module.exports = new Scrape();
