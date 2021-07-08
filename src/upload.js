#!/usr/bin/env node
const utils = require("./utils");
const { base } = require("./const");

try {
  console.log(
    "@xiaobai-world/uplaod version:",
    require("./package.json").version
  );
} catch (e) {
  console.warn(`You must use this command at the root of the "vite" project`);
}

const { default: axios } = require("axios");
const FormData = require("form-data");
const path = require("path");
const package = require(path.join(process.env.PWD, "package.json"));

const fs = require("fs");
const { execSync } = require("child_process");
const distPath = process.env.PWD + "/dist";

function readDir(dir, arr) {
  const files = fs.readdirSync(dir);
  files.forEach((item) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    const file = {
      fullPath,
      baseName: path.basename(fullPath),
      relativePath: fullPath.replace(distPath, ""),
      size: stat.size,
    };
    file.type = stat.isDirectory() ? "directory" : "file";
    if (file.type === "directory") {
      readDir(path.join(dir, item), arr);
    } else {
      file.type = "file";
    }
    arr.push(file);
  });
  return arr;
}

async function uploadFile(file) {
  let form = new FormData();
  console.log(package.version, package.name, package.title);
  form.append("version", package.version);
  form.append("name", package.name);
  form.append("title", package.title ? package.title : package.name);
  form.append("baseName", file.baseName);
  form.append("relativePath", file.relativePath);
  form.append(
    "description",
    package.description
      ? package.description
      : "the description field of package.json has not been set"
  );
  form.append("type", file.type);
  form.append("size", file.size);
  if (file.type === "file") {
    form.append("file", fs.createReadStream(file.fullPath));
  }
  try {
    await axios.post(`${base}/store/upload`, form, {
      headers: {
        ...form.getHeaders(),
        ...utils.getAxiosHeader(),
      },
    });
  } catch (e) {
    console.error(e.response.data);
  }
  console.log(`upload success: ${file.relativePath}`);
}

async function buildAndUpload() {
  if (!package.name) {
    throw new Error("Please ensure package.json includes field of name");
  }
  if (!package.version) {
    throw new Error("Please ensure package.json includes field of version");
  }

  // clear the file list of the test enviroment
  try {
    await axios.post(
      `${base}/store/cleanTestApp`,
      {
        version: package.version,
        name: package.name,
      },
      {
        headers: {
          ...utils.getAxiosHeader(),
        },
      }
    );
  } catch (e) {
    console.error(e);
    return;
  }

  // get upload path
  let pathRes;
  try {
    pathRes = await axios.post(
      `${base}/store/getBasePath`,
      {
        version: package.version,
        name: package.name,
      },
      {
        headers: {
          ...utils.getAxiosHeader(),
        },
      }
    );
  } catch (e) {
    console.error(e.response.data);
    return;
  }

  console.log("base", pathRes.data);

  // npm run build
  const cmd = `npm run build -- --logLevel=all --manifest --base=${pathRes.data}/`;
  console.log("cmd is:", cmd);
  const execRes = execSync(cmd, {
    cwd: process.env.PWD,
  }).toString();

  console.log("done", execRes);

  const fileList = readDir(distPath, []);

  for (let file of fileList) {
    try {
      console.log("upload file", file);
      await uploadFile(file);
    } catch (e) {
      console.error(e.response.data);
    }
  }

  const faviconIdx = fileList.findIndex((file) =>
    /favicon.*(svg|png|jpg|webp|avif|gif|ico)$/i.test(file.baseName)
  );

  if (faviconIdx < 0) {
    throw new Error(
      "favicon icon not found. please ensure favicon.svg(also can be spng|jpg|webp|avif|gif|ico) in src and index.html included it."
    );
  }

  // check entry
  const mainifest = require(path.join(distPath, "manifest.json"));
  try {
    await axios.post(
      `${base}/store/setTestAppEntry`,
      {
        // report favicon.path, will be used as the icon of the application
        favicon: path.join(pathRes.data, fileList[faviconIdx].relativePath),
        // js entry
        jsEntry: path.join(pathRes.data, mainifest["index.html"].file),
        css: mainifest["index.html"].css.map((p) => path.join(pathRes.data, p)),
        version: package.version,
        name: package.name,
        title: package.title ? package.title : package.name,
      },
      {
        headers: {
          ...utils.getAxiosHeader(),
        },
      }
    );
  } catch (e) {
    console.error(e)
    console.error(e.response.data);
  }
}

module.exports = { buildAndUpload };
