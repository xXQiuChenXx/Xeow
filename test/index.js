const yml = require("js-yaml");
const fs = require("fs");
console.log(yml.safeLoad(fs.readFileSync("./language/en/main.yml", "utf-8")));