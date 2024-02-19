import axios, { AxiosRequestConfig } from "axios";
import * as https from "https";
export const axiosMaster = async (
  name?: any,
  log?: boolean,
  default_config?: any,
  time?: any
) => {
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
  let timer: any = 0;
  const interval = setInterval(function () {
    const elapsedTime = Date.now() - startTime;
    timer = (elapsedTime / 1000).toFixed(5);
  }, 1);
  try {
    const response: any = await axios(config);
    clearInterval(interval);
    console.log("\x1b[32m", ": resolve");
    console.log("\x1b[33m", `${name ? name : config.url} => ${timer} s :`);
    if (log) {
      console.log(response?.data);
    }
    console.log("\x1b[32m", ": resolve");
    return Promise.resolve(response?.data);
  } catch (error) {
    clearInterval(interval);
    console.log("\x1b[35m", ": reject");
    console.log("\x1b[33m", `${name ? name : config.url} => ${timer} s :`);
    console.log(error?.response?.data);
    console.log("\x1b[35m", ": reject");
    return Promise.reject(error?.response?.data);
  }
};
export const axiosMasterLogger = async (
  default_config: AxiosRequestConfig,
  masterConfig: {
    name?: string;
    log?: boolean;
    timeout?: number;
    logger?: (data: {
      log_levels:
        | string
        | "DEBUG"
        | "INFO"
        | "WARN"
        | "ERROR"
        | "CRITICAL"
        | "TRACE";
      message: string;
      json: Object;
    }) => void;
  }
) => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
  const config: AxiosRequestConfig = {
    ...{
      timeout: masterConfig.timeout ? masterConfig.timeout : 20 * 1000,
      httpsAgent: httpsAgent,
    },
    ...default_config,
  };
  const startTime = Date.now();
  let timer: any = 0;
  const interval = setInterval(function () {
    const elapsedTime = Date.now() - startTime;
    timer = (elapsedTime / 1000).toFixed(5);
  }, 1);
  let response_log = {};
  let response_type:
    | string
    | "DEBUG"
    | "INFO"
    | "WARN"
    | "ERROR"
    | "CRITICAL"
    | "TRACE" = "INFO";
  try {
    const response: any = await axios(config);
    clearInterval(interval);
    console.log("\x1b[32m", ": resolve");
    console.log(
      "\x1b[33m",
      `${masterConfig.name ? masterConfig.name : config.url} => ${timer} s :`
    );
    if (masterConfig.log) {
      console.log(response);
    }
    console.log("\x1b[32m", ": resolve");
    response_log = response?.data;
    return Promise.resolve(response?.data);
  } catch (error) {
    clearInterval(interval);
    if (masterConfig.log) {
      console.log(error);
    }
    response_log = error;
    response_type = "WARN";
    console.log("\x1b[35m", ": reject");
    console.log(
      "\x1b[33m",
      `${masterConfig.name ? masterConfig.name : config.url} => ${timer} s :`
    );
    console.log(error?.response?.data);
    console.log("\x1b[35m", ": reject");
    return Promise.reject(error?.response?.data);
  } finally {
    try {
      masterConfig.logger({
        log_levels: "WARN",
        message: `API -> ${masterConfig.name ? masterConfig.name : config.url}`,
        json: {
          time: timer,
          request: config,
          response: response_log,
        },
      });
    } catch (error) {}
  }
};
export default axiosMaster;
