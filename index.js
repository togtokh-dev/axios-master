const axios = require("axios");
const https = require("https");
axiosMaster = async (name, log, default_config, time) => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
  const config = {
    ...{
      timeout: time ? time : 20 * 1000,
      httpsAgent: httpsAgent,
    },
    ...default_config,
  };

  const startTime = Date.now();
  let timer = 0;
  const interval = setInterval(function () {
    const elapsedTime = Date.now() - startTime;
    timer = (elapsedTime / 1000).toFixed(5);
  }, 1);
  try {
    const response = await axios(config);
    clearInterval(interval);
    console.log("\x1b[32m", ": resolve");
    console.log("\x1b[33m", `${name ? name : config.url} => ${timer} s :`);
    if (log) {
      console.log(response.data);
    }
    console.log("\x1b[32m", ": resolve");
    return Promise.resolve(response.data);
  } catch (error) {
    clearInterval(interval);
    console.log("\x1b[35m", ": reject");
    console.log("\x1b[33m", `${name ? name : config.url} => ${timer} s :`);
    console.log(error.response.data);
    console.log("\x1b[35m", ": reject");
    return Promise.reject(error.response.data);
  }
};
module.exports = axiosMaster;
