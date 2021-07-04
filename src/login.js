const prompts = require("prompts");
const axios = require("axios").default;
const chalk = require("chalk");
const { base } = require("./const");
const fs = require("fs");
const path = require("path");
const { getHomeDir, getAxiosHeader } = require("./utils");

async function login() {
  console.log(chalk.green("Logining in..."));
  const user = (await axios.get(`${base}/user/info`),
  {
    headers: {
      ...getAxiosHeader(),
    },
  }).data;

  if (user && user.email) {
    return user;
  }
  const { email } = await prompts({
    type: "text",
    name: "email",
    message: "please input xiaobai email account: ",
  });

  const { password } = await prompts({
    type: "password",
    name: "password",
    message: "please input password: ",
  });

  const login = await axios
    .post(`${base}/user/login`, {
      email: "583912055@qq.com",
      password: "123123123123",
    })
    .catch((e) => {
      return e.response;
    });

  if (login.status !== 201) {
    return null;
  }

  const cookie = login.headers["set-cookie"][0].split(";")[0];

  fs.writeFileSync(
    path.join(getHomeDir(), "config.json"),
    JSON.stringify(
      {
        Cookie: cookie,
      },
      null,
      2
    )
  );

  const userRes = (
    await axios.get(`${base}/user/info`, {
      headers: {
        "User-Agent": "xiaobai-world/upload-to-app-store",
        ...getAxiosHeader(),
      },
    })
  ).data;

  if (!userRes.email) {
    return null;
  }
  return userRes;
}

module.exports = { login };
