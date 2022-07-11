const REONOMY_URL = "https://app.reonomy.com/!/search/c14bdcad-bf3a-462f-acf2-6e9cdaf66341";
let website = REONOMY_URL;
let pageNumber = 1;
let nextUrl;
let url = REONOMY_URL;
let nextPage = 2;

if (url.includes("page=")) {
    pageNumber = Number(url.split("page=").pop());
    nextPage = pageNumber + 1;
    nextUrl = `${url.split("page=")[0]}page=${nextPage}`;
} else {
    nextUrl = `${url}?page=${nextPage}`;
}

console.log({ pageNumber });
console.log({ nextPage });
console.log({ nextUrl });
