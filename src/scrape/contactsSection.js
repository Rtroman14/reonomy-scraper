module.exports = async (page) => {
    return await page.evaluate(async () => {
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
                let contact = {};

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

            const contactsInfo = contactInfo(contactInfoSections);

            contactsInfo.forEach((contactInfo) => {
                contacts.push({ ...contact, ...contactInfo });
            });
        }

        return contacts;
    });
};
