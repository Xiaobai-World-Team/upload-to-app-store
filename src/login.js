const prompts = require("prompts");
const axios = require("axios").default;
const chalk = require("chalk");
const { base } = require("./const");
const fs = require("fs");
const path = require("path");

async function login() {
  console.log(chalk.green("Logining in..."));
  const user = (await axios.get(`${base}/user/info`)).data;
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
    console.error(login.data.message);
    e;
    return;
  }
  const dir = path.join(process.env.HOME, ".xiaobai-world");
  const cookie = login.headers["set-cookie"][0].split(";")[0];
  try {
    fs.mkdirSync(dir);
  } catch (e) {}
  fs.writeFileSync(
    path.join(dir, "config.json"),
    JSON.stringify(
      {
        cookie,
      },
      null,
      2
    )
  );
  const userRes = (
    await axios.get(`${base}/user/info`, {
      headers: {
        "User-Agent": "xiaobai-world/upload-to-app-store",
        Cookie: cookie,
      },
    })
  ).data;

  console.log("userRes", userRes);
  if (!userRes.email) {
    throw new Error("login failed.");
  }
  return userRes;
}

module.exports = { login };
