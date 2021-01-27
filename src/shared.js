const Papa = require("papaparse");
const fs = require("fs");

module.exports.CLUTCH_URL = "https://clutch.co/";
module.exports.DATE = new Date().valueOf();

const sleep = ms => new Promise(r => setTimeout(r, ms));

const randomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.randomSleep = () => sleep(randomInt(1, 1000));

module.exports.parseIndexFile = () => {
  const fileName = process.argv[2];
  if (typeof fileName !== "string" || fileName.indexOf(".csv") === -1) {
    throw new Error("invalid file name provided");
  }
  const file = fs.readFileSync(fileName, "utf8");
  const results = Papa.parse(file);
  if (results.errors.length > 0) {
    console.error(results.errors);
    throw new Error("papa parse error");
  }
  if (results.data.some(entry => entry.length !== 7)) {
    throw new Error("data corrupt");
  }
  return;
};
