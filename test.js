const REONOMY_URL = "https://app.reonomy.com/!/search/c14bdcad-bf3a-462f-acf2-6e9cdaf66341";
// const REONOMY_URL = "https://app.reonomy.com/!/search/c14bdcad-bf3a-462f-acf2-6e9cdaf66341?page=2";
let website = REONOMY_URL;
let pageNumber = 1;
let nextUrl;
let url = REONOMY_URL;
let nextPage = 2;

const _ = require("./src/Helpers");

let metadata = {
    pageNumber: 1,
    nextPage: 2,
    nextUrl: "",
};

// if (url.includes("page=")) {
//     pageNumber = Number(url.split("page=").pop());
//     nextPage = pageNumber + 1;
//     nextUrl = `${url.split("page=")[0]}page=${nextPage}`;

//     metadata.pageNumber = Number(url.split("page=").pop());
//     metadata.nextPage = pageNumber + 1;
//     metadata.nextUrl = `${url.split("page=")[0]}page=${metadata.nextPage}`;
// } else {
//     nextUrl = `${url}?page=${nextPage}`;
//     metadata.nextUrl = `${url.split("page=")[0]}page=${metadata.nextPage}`;
// }

metadata = _.pageMetadata(url, metadata);

// console.log({ pageNumber });
// console.log({ nextPage });
// console.log({ nextUrl });

console.log(metadata);
