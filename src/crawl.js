const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const Papa = require("papaparse");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const shared = require("./shared");

const { DATE, randomSleep, parseIndexFile } = shared;

const index = parseIndexFile();

const errorWriter = createCsvWriter({
  path: `data/${DATE}-crawler-error.csv`,
  header: ["profile"]
});

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  process.once("SIGINT", () => browser.close());
  const page = await browser.newPage();
  // TODO crawl
  await browser.close();
})();
