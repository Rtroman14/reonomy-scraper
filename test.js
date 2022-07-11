const moment = require("moment");
const writeJson = require("./src/writeJson");

const time = moment().format("M.D.YYYY-hh:mm"); // Wednesday

console.log(`TEST_P=2_T=${time}`);

// writeJson([{ name: "ryan" }], `TEST_P=2_T=${time}`);
