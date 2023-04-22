const URL = ` 
https://airtable.com/appYumwuXN874vUTb/tblX9xhsqAVhjT9NS/viwfXdZN6k2hMmZmB/recHzmSxSUmW1SGgp?blocks=hide
`;

const [, , , BASE_ID, , , RECORD_ID] = URL.split("?")[0].split("/");

module.exports = {
    BASE_ID,
    RECORD_ID,
    TOTAL_PROPERTIES: 9000, // total contacts to fetch
};
