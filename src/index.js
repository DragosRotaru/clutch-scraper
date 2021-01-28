const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const shared = require("./shared");

const { CLUTCH_URL, DATE, randomSleep } = shared;

const dataWriter = createCsvWriter({
  path: `../data/${DATE}-index.csv`,
  header: ["id", "name", "tagline", "profile", "website", "directory", "page"],
});
const errorWriter = createCsvWriter({
  path: `data/${DATE}-index-error.csv`,
  header: ["directory", "page"],
});

const DIRECTORIES = [
  "directory/mobile-application-developers",
  "web-developers",
  "web-designers",
  "it-services",
  "bpo",
  "seo-firms",
  "agencies",
];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  process.once("SIGINT", () => browser.close());
  const page = await browser.newPage();

  for (let i = 0; i < DIRECTORIES.length; i++) {
    const directory = DIRECTORIES[i];
    const directoryURL = CLUTCH_URL + directory + "?page=";
    let hasResults = true;
    let pageNum = 1;
    try {
      while (hasResults) {
        await randomSleep();
        await page.goto(directoryURL + pageNum, {
          timeout: 1000000,
        });
        const $ = cheerio.load(await page.content());
        hasResults = $("li.provider-row").length > 0;
        if (hasResults) {
          console.log("extracting page: ", pageNum);
          $("li.provider-row").map(async (i, el) => {
            try {
              const entry = {
                id: $(el).attr("data-clutch-pid"),
                name: $(el).find(".company_info h3").text().trim(),
                tagline: $(el).find(".tagline").text().trim(),
                profile: $(el).find(".company_info a").attr("href"),
                website: new URL($(el).find(".website-link__item").attr("href"))
                  .origin,
                directory: directory,
                page: pageNum,
              };
              if (entry.id.length === 0 || entry.profile.length === 0)
                throw new Error("missing info");

              await dataWriter.writeRecords([entry]);
            } catch (error) {
              console.log(
                "error on ",
                directory,
                "page ",
                pageNum,
                ", element ",
                i,
                "error ",
                error
              );
            }
          });
          pageNum++;
        }
      }
    } catch (error) {
      console.log(error);
      console.log("error on ", directoryURL, "page ", pageNum);
      await errorWriter.writeRecords([{ directory: directory, page: pageNum }]);
    }
  }
  await browser.close();
})();
