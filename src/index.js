#!/usr/bin/env node

const { login } = require("./login");
const { buildAndUpload } = require("./upload");

async function start() {
  const user = await login().catch((e) => {
    return null;
  });
  if (!user) {
    console.error("login failed.");
  }
  console.log("login success", user);
  await buildAndUpload();
}

start();
