require("dotenv").config();

const Airtable = require("./src/Airtable");
const BASE_ID = "appAIW4VnbrWGlPWs";
const RECORD_ID = "recIEJsdf8AZBFlZZ";

let territoryRecord;

(async () => {
    try {
        territoryRecord = await Airtable.getRecord(BASE_ID, RECORD_ID);

        const reonomyData = {
            Location: territoryRecord.Location,
            Source: "Reonomy",
            Tag: territoryRecord.Tag || "",
        };
        const reonomyDataFormatted = Airtable.formatted([reonomyData]);
        const [newRecord] = await Airtable.createRecords(reonomyDataFormatted, BASE_ID, "Data");
        console.log(newRecord.id);
    } catch (error) {
        console.log(error);
    }
})();
