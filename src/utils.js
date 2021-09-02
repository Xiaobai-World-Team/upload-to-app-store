const fs = require("fs");
const path = require("path");
const { base } = require("./const");
const { createHash } = require("crypto");
const hash = createHash(`sha256`);
hash.update(base);
const baseHash = hash.digest('hex')

function getHomeDir() {
  return path.join(process.env.HOME, `.xiaobai-world-${baseHash}`);
}

function getConfig() {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(getHomeDir(), "config.json")).toString()
    );
  } catch (e) {
    return {};
  }
}

function getAxiosHeader() {
  let cfg = getConfig();
  return {
    Cookie: cfg.Cookie ? cfg.Cookie : "",
  };
}

module.exports = {
  getHomeDir,
  getConfig,
  getAxiosHeader,
};
