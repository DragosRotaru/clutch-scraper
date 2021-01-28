// TODO dont scrape entries where file is already present

/* 
Later

article#focus
article#portfolio
article#reviews
*/

const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const shared = require("./shared");

const { CLUTCH_URL, DATE, randomSleep, parseIndexFile } = shared;

const index = parseIndexFile();

const errorWriter = createCsvWriter({
  path: `data/${DATE}-details-error.csv`,
  header: ["profile"]
});

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  process.once("SIGINT", () => browser.close());
  const page = await browser.newPage();
  for (let i = 0; i < index.length; i++) {
    const entry = index[i];
    const record = {
      id: entry[0],
      name: entry[1],
      tagline: entry[2],
      profile: entry[3],
      location: entry[4],
      website: entry[5],
      directory: entry[6],
      page: entry[7]
    };
    try {
      await randomSleep();
      await page.goto(CLUTCH_URL + record.profile, {
        timeout: 1000000
      });
      const $ = cheerio.load(await page.content());
      // Summary
      const ctx = "article#summary";
      record.verified = $(".verification-wrapper-status __topstatus", ctx)
        .text()
        .trim();
      record.description = $("[property=description]", ctx)
        .text()
        .trim();
      record.min_project_size = $(".bordered-mobile-block .field-items", ctx)
        .eq(0)
        .text()
        .trim();
      record.avg_hourly_rate = $(".bordered-mobile-block .field-items", ctx)
        .eq(1)
        .text()
        .trim();
      record.num_employees = $(".bordered-mobile-block .field-items", ctx)
        .eq(2)
        .text()
        .trim();
      record.founded = $(".bordered-mobile-block .field-items", ctx)
        .eq(3)
        .text()
        .trim();
      record.locations = [];
      // locations
      $(".profile-map-block .vcard", ctx).map((i, el) => {
        const location = {
          headquarters: i === 0,
          address: $(el)
            .find(".street-address")
            .text()
            .trim(),
          locality: $(el)
            .find(".locality")
            .text()
            .trim(),
          region: $(el)
            .find(".region")
            .text()
            .trim(),
          postal_code: $(el)
            .find(".postal-code")
            .text()
            .trim(),
          country: $(el)
            .find(".country-name")
            .text()
            .trim(),
          phone: $(el)
            .find(".tel")
            .text()
            .trim()
        };
        record.locations.push(location);
      });
      fs.writeFileSync(
        "data/details/" + record.id + "-" + date + "-details.json",
        JSON.stringify(record, null, 2)
      );
      console.log(
        "progress: ",
        (i / index.length).toFixed(5),
        "%",
        "record: ",
        record.id
      );
    } catch (error) {
      console.log("error on ", record.profile, error);
      await errorWriter.writeRecords([{ directory: record.profile }]);
    }
  }
  await browser.close();
})();
