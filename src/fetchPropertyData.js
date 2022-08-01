const Reonomy = require("./Reonomy");
const _ = require("./Helpers");

module.exports = async (headers, propertyID) => {
    try {
        const stats = await Reonomy.propertyStats(headers, propertyID);

        let { contacts, owners } = await Reonomy.propertyContactIDs(headers, propertyID);

        const contactIDs = _.filteredContacts(contacts).map((contact) => contact.id);
        const ownerIDs = _.filteredOwners(owners).map((owner) => owner.id);

        const prospectIDs = [...new Set([...contactIDs, ...ownerIDs])];

        if (prospectIDs.length) {
            const { items: prospects } = await Reonomy.propertyContacts(headers, prospectIDs);

            return {
                stats,
                prospects,
            };
        }

        return {};
    } catch (error) {
        console.log(error);
        return {};
    }
};
