require("dotenv").config();

const axios = require("axios");
const writeJson = require("./src/writeJson");

const Airtable = require("./src/Airtable");
const BASE_ID = "appr7rcKd3W6oMdiC";
const RECORD_ID = "recbj7CjpK2iNZDdg";

const allProperties = [1, 2, 3, 4, 5, 6];

(async () => {
    try {
        for (let i = 1; i <= 6; i++) {
            if (i % 2 === 0) {
                console.log(i);
            }
        }
    } catch (error) {
        console.log(error);
    }
})();
