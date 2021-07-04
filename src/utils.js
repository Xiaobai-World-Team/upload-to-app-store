const fs = require("fs");
const path = require("path");

function getHomeDir() {
  return path.join(process.env.HOME, ".xiaobai-world");
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
