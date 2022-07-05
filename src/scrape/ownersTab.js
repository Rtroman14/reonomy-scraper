module.exports = async (page) => {
    return await page.evaluate(async () => {
        await delay(3000);

        // *  ---------------- getText() ----------------------
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

        // *  ---------------- phoneSection() ----------------------
        const phoneSection = (section) => {
            try {
                let contacts = [];

                const phoneNumbers = section.querySelectorAll(".MuiGrid-item");

                if (phoneNumbers.length) {
                    for (const phoneNumber of phoneNumbers) {
                        let contact = {};

                        const phoneIcon = phoneNumber.querySelector(".MuiSvgIcon-root");

                        if (
                            phoneIcon.innerHTML.length >= 850 &&
                            phoneIcon.innerHTML.length <= 900
                        ) {
                            contact["Phone Number"] = getText(phoneNumber, ".MuiTypography-root");
                            contact.Email = "";
                            contact.Outreach = "Text";

                            contacts.push(contact);
                        }
                    }
                }

                return contacts;
            } catch (error) {
                console.log(error);
                return [];
            }
        };
        // *  ---------------- contactInfo() ----------------------
        const contactInfo = (section) => {
            try {
                let contacts = [];

                for (const contactInfoSection of section) {
                    const sectionTitle = getText(contactInfoSection, "p.MuiTypography-root");

                    if (sectionTitle === "Phone Numbers") {
                        const phoneNumberContacts = phoneSection(contactInfoSection);

                        for (const phoneNumberContact of phoneNumberContacts) {
                            contacts.push(phoneNumberContact);
                        }
                    }
                    if (sectionTitle === "Emails") {
                        const emails = contactInfoSection.querySelectorAll(".MuiGrid-item");

                        if (emails.length) {
                            for (const email of emails) {
                                let contact = {};

                                contact["Email"] = getText(email, ".MuiTypography-root");
                                contact["Phone Number"] = "";
                                contact.Outreach = "Email";

                                contacts.push(contact);
                            }
                        }
                    }
                }

                return contacts;
            } catch (error) {
                console.log(error);
                return [];
            }
        };

        // *  ---------------- SCRAPE ----------------------
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
                    await delay(3000);
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

                const contactsInfo = contactInfo(ownerContactInfoSections);

                contactsInfo.forEach((contactInfo) => {
                    contacts.push({ ...contact, ...contactInfo });
                });
            }
        }

        return contacts;
    });
};
