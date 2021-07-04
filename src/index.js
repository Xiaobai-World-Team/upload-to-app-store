const { login } = require("./login");

(async () => {
  const user = await login().catch((e) => {
    return null;
  });
  if(!user) {
    return 'login failed'
  }
})();
