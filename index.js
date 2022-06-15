let properties = [];

let run = true;

const getText = (doc, selector) => {
    if (doc.querySelector(selector)) {
        return doc.querySelector(selector).innerText;
    }

    return "";
};

const phoneSection = (section) => {
    let contacts = [];

    const phoneNumbers = section.querySelectorAll(".MuiGrid-item");

    if (phoneNumbers.length) {
        for (const phoneNumber of phoneNumbers) {
            let contact = {};

            const phoneIcon = phoneNumber.querySelector(".MuiSvgIcon-root");

            if (phoneIcon.innerHTML.length >= 850 && phoneIcon.innerHTML.length <= 900) {
                contact["Phone Number"] = getText(phoneNumber, ".MuiTypography-root");
                contact.Email = "";
                contact.Outreach = "Text";

                contacts.push(contact);
            }
        }
    }

    return contacts;
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let page = 0;
let state;

while (run) {
    let property = {};
    property.Url = window.location.href;
    property.Source = "Reonomy";

    await delay(4000);

    try {
        // * -------------- Tab: Building & Lot --------------
        const buildingTabButton = document.querySelector("#property-details-tab-building");
        if (buildingTabButton !== null) {
            buildingTabButton.click();
        } else {
            document.querySelector("#property-details-tab-building");
        }
        await delay(2000);

        let error = document.querySelector("#root header > h6");

        if (error !== null) {
            document.querySelector("#search-results-step-up").click();

            await delay(4000);

            document.querySelector("#property-details-tab-building").click();

            await delay(1000);
        }

        property.Address = getText(document, "p[data-test-id='header-property-address']");

        // format address
        let currentState;
        if (property.Address.split(",").length === 3) {
            currentState = property.Address.split(", ")[2].split(" ")[0];
            state = currentState.length > 2 ? state : currentState;

            property.Street = property.Address.split(", ")[0];
            property.City = property.Address.split(", ")[1]; // DOUBLE CHECK
            property.Zip = property.Address.split(" ").pop();
        } else if (property.Address.length === 2) {
            property.State = property.Address;
        } else {
            currentState = property.Address.split(" ")[1];
            state = currentState.length > 2 ? state : currentState;

            property.Street = "";
            property.City = property.Address.split(", ")[0];
            property.Zip = property.Address.split(" ").pop();
        }
        property.State = state;

        // * -------------- Tab: Building & Lot --------------
        let buildingSection = document.querySelector(
            "#property-details-section-building > div > div:nth-child(1) > div:nth-child(1)"
        );

        // * -------------- Section: Building
        const yearBuilt = getText(buildingSection, "dl:nth-child(1) dd");
        const yearRenovated = getText(buildingSection, "dl:nth-child(2) dd");
        const squareFeet = getText(buildingSection, "dl:last-child dd").split(" ")[0];
        property["Square Feet"] = squareFeet === "--" ? "" : squareFeet;
        property["Year Built"] = yearBuilt === "--" ? "" : yearBuilt;
        property["Year Renovated"] = yearRenovated === "--" ? "" : yearRenovated;

        // * -------------- Section: Lot
        let lotSection = document.querySelector(
            "#property-details-section-building > div > div:nth-child(1) > div:nth-child(2)"
        );
        property["Building Type"] = getText(lotSection, "dl:nth-child(1) dd");

        // * -------------- Tab: Owner --------------
        document.querySelector("#property-details-tab-ownership").click();
        await delay(4000);

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
                    await delay(300);
                }

                const fullName = getText(owner, ".MuiGrid-item .MuiTypography-root");

                contact["Properties in Portfolio"] = getText(
                    owner,
                    ".MuiGrid-item:nth-child(3) p:nth-child(2) span"
                );
                contact["Portfolio Assessed Value"] = getText(
                    owner,
                    ".MuiGrid-item:nth-child(3) p:nth-child(4) span"
                );
                contact["Last Acquisition Date"] = getText(
                    owner,
                    ".MuiGrid-item:nth-child(4) p:nth-child(2)"
                );
                contact["Property Types in Portfolio"] = getText(
                    owner,
                    ".MuiGrid-item:nth-child(5) > div > div"
                )
                    .split("\n\n")
                    .join(", ");

                contact["Full Name"] = fullName;
                contact["First Name"] = fullName.split(" ")[0] || "";
                contact["Last Name"] = fullName.split(" ").slice(1).join(" ") || "";
                contact.Title = "Owner";
                contact["Contact Address"] = getText(
                    owner,
                    `[data-testid="people-contact-address-id"]`
                );

                const ownerContactInfoSections = owner.querySelectorAll(
                    ".MuiDivider-root ~ .MuiGrid-container > .MuiGrid-item"
                );

                for (let ownerContactInfoSection of ownerContactInfoSections) {
                    const sectionTitle = getText(ownerContactInfoSection, "p.MuiTypography-root");

                    if (sectionTitle === "Phone Numbers") {
                        const phoneNumberContacts = phoneSection(ownerContactInfoSection);

                        for (const phoneNumberContact of phoneNumberContacts) {
                            contact = { ...contact, ...phoneNumberContact };
                            properties.push({ ...property, ...contact });
                        }
                    }
                    if (sectionTitle === "Emails") {
                        const emails = ownerContactInfoSection.querySelectorAll(".MuiGrid-item");

                        if (emails.length) {
                            for (const email of emails) {
                                contact["Email"] = getText(email, ".MuiTypography-root");
                                contact["Phone Number"] = "";
                                contact.Outreach = "Email";

                                properties.push({ ...property, ...contact });
                            }
                        }
                    }
                }
            }
        }

        // * -------------- Section: Contacts
        let contactNameSections = document.querySelectorAll(`[data-testid="contact-item"]`);
        let contactFieldsSections = document.querySelectorAll(
            `[data-testid="contact-item"]  ~ div`
        );
        const numContacts = contactNameSections.length;

        for (let i = 0; i < numContacts; i++) {
            let contact = {};

            const contactName = getText(contactNameSections[i], "p.MuiTypography-root");
            contact.Title = getText(
                contactNameSections[i],
                "p.MuiTypography-colorTextSecondary:last-child"
            );

            contact["Full Name"] = contactName;
            contact["First Name"] = contactName.split(" ")[0] || "";
            contact["Last Name"] = contactName.split(" ").slice(1).join(" ") || "";
            contact["Contact Address"] = getText(
                contactFieldsSections[i],
                `[data-testid="people-contact-address-id"]`
            );

            const contactInfoSections = contactFieldsSections[i].querySelectorAll(
                ".MuiBox-root > .MuiBox-root > .MuiGrid-container > div"
            );

            for (const contactInfoSection of contactInfoSections) {
                const sectionTitle = getText(contactInfoSection, "p.MuiTypography-root");

                if (sectionTitle === "Phone Numbers") {
                    const phoneNumberContacts = phoneSection(contactInfoSection);

                    for (const phoneNumberContact of phoneNumberContacts) {
                        contact = { ...contact, ...phoneNumberContact };
                        properties.push({ ...property, ...contact });
                    }
                }
                if (sectionTitle === "Emails") {
                    const emails = contactInfoSection.querySelectorAll(".MuiGrid-item");

                    if (emails.length) {
                        for (const email of emails) {
                            contact["Email"] = getText(email, ".MuiTypography-root");
                            contact["Phone Number"] = "";
                            contact.Outreach = "Email";

                            properties.push({ ...property, ...contact });
                        }
                    }
                }
            }
        }

        const [currentProperty, , totalProperties] = document
            .querySelector("#search-box-results")
            .innerText.split("\n");

        // * -------------- Export properties --------------
        if (currentProperty === totalProperties) {
            console.log("currentProperty === totalProperties");
            exportFile(properties, `reonomy pages 0-${page}_${state || ""}.json`);
            properties = [];
            run = false;
        }
        if (page !== 0 && page % 400 === 0) {
            exportFile(properties, `reonomy pages 0-${page}_${state || ""}.json`);
            properties = [];
        }
        if (!run) {
            exportFile(properties, `reonomy pages 0-${page}_${state || ""}.json`);
            properties = [];
        }

        // * -------------- Next page --------------
        document.querySelector("#search-results-step-up").click();
        page++;
    } catch (error) {
        console.log("ERROR ---", error);

        exportFile(properties, `reonomy pages 0-${page}_${state || ""}.json`);
        properties = [];
        run = false;
    }
}
