const prompts = require("prompts");
const axios = require("axios").default;
const chalk = require("chalk");
const { base } = require("./const");
const fs = require("fs");
const { getXiaobaiConfigPath, getAxiosHeader } = require("./utils");

/**
 * 登录
 * @returns {email: string} | null
 */
async function login() {
  console.log(chalk.green("Logining in..."), base);
  const user = await axios.get(`${base}/user/info`, {
    headers: {
      ...getAxiosHeader(),
    },
  });

  if (user.data && user.data.email) {
    return user.data;
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
      email,
      password,
    })
    .catch((e) => {
      return e;
    });

  if (login.status !== 201) {
    throw new Error("Login fail");
  }

  const cookie = login.headers["set-cookie"][0].split(";")[0];

  fs.writeFileSync(
    getXiaobaiConfigPath(),
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
