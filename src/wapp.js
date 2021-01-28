const fs = require("fs");
const Papa = require("papaparse");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const Wappalyzer = require("wappalyzer");
const shared = require("./shared");

const { DATE, randomSleep, parseIndexFile } = shared;

const index = parseIndexFile();

const errorWriter = createCsvWriter({
  path: `data/${DATE}-wapp-error.csv`,
  header: ["profile"]
});

const options = {
  browser: "puppeteer",
  debug: false,
  delay: 250,
  maxDepth: 3,
  maxUrls: 10,
  maxWait: 10000,
  recursive: true,
  htmlMaxCols: 2000,
  htmlMaxRows: 2000
};

(async () => {
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
      const wappalyzer = new Wappalyzer(record.website, options);
      const json = await wappalyzer.analyze();
      json.website = record.website;
      json.id = record.id;
      fs.writeFileSync(
        "wapp/" + record.id + "-" + date + "-wapp.json",
        JSON.stringify(json, null, 2)
      );
      console.log(
        "progress: ",
        (i / index.length).toFixed(5),
        "%",
        "record: ",
        record.id
      );
    } catch (error) {
      console.log("error on ", record.website, error);
      await errorWriter.writeRecords([{ directory: record.profile }]);
    }
  }
})();
