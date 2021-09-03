const fs = require("fs");
const path = require("path");
const { base } = require("./const");
const { createHash } = require("crypto");
const hash = createHash(`sha256`);
hash.update(base);
const baseHash = hash.digest("hex");

function getXiaobaiConfigPath() {
  return path.join(process.env.HOME, `.xiaobai-world-config-${baseHash}.json`);
}

function getConfigObject() {
  try {
    return JSON.parse(fs.readFileSync(getXiaobaiConfigPath()).toString());
  } catch (e) {
    return {};
  }
}

function getAxiosHeader() {
  let cfg = getConfigObject();
  return {
    Cookie: cfg.Cookie ? cfg.Cookie : "",
  };
}

module.exports = {
  getXiaobaiConfigPath,
  getConfigObject,
  getAxiosHeader,
};
