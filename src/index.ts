import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import * as https from "https";
interface MasterConfig {
  name?: string;
  log?: boolean;
  timeout?: number;
  logger?: (data: {
    log_levels:
      | "DEBUG"
      | "INFO"
      | "WARN"
      | "ERROR"
      | "CRITICAL"
      | "TRACE"
      | string;
    message: string;
    json: Object;
  }) => void;
  shouldRetry?: boolean;
  shouldRetryStatus?: number[];
  retryFunction?: () => Promise<string>;
}
export const axiosMaster = async (
  name?: string | number,
  log?: boolean,
  default_config?: any,
  time?: number | string
) => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
  const config: AxiosRequestConfig = {
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
  let timer: number | string = 0;
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
    const response = await axios(config);
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
      masterConfig?.logger({
        log_levels: "WARN",
        message: `API -> ${masterConfig.name ? masterConfig.name : config.url}`,
        json: {
          time: timer,
          request: default_config,
          response: response_log,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
};

export const axiosMasterMain = async (
  default_config: AxiosRequestConfig,
  masterConfig: MasterConfig
): Promise<AxiosResponse | any> => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
  const config: AxiosRequestConfig = {
    timeout: masterConfig.timeout || 20000,
    httpsAgent: httpsAgent,
    ...default_config,
  };

  const startTime = Date.now();
  let timer: number = 0;
  const interval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    timer = parseFloat((elapsedTime / 1000).toFixed(5));
  }, 1);

  const log = (level: string, message: string, data: Object) => {
    if (masterConfig.logger) {
      masterConfig.logger({
        log_levels: level,
        message: message,
        json: data,
      });
    }
  };

  const makeRequest = async (): Promise<AxiosResponse> => {
    try {
      const response = await axios(config);
      clearInterval(interval);
      console.log("\x1b[32m", ": resolve");
      console.log(
        "\x1b[33m",
        `${masterConfig.name || config.url} => ${timer} s :`
      );
      if (masterConfig.log) {
        console.log(response);
      }
      console.log("\x1b[32m", ": resolve");
      return response;
    } catch (error) {
      clearInterval(interval);
      if (masterConfig.log) {
        console.log(error);
      }
      console.log("\x1b[35m", ": reject");
      console.log(
        "\x1b[33m",
        `${masterConfig.name || config.url} => ${timer} s :`
      );
      if (error instanceof AxiosError && error.response) {
        console.log(error.response.data);
      }
      console.log("\x1b[35m", ": reject");
      throw error;
    }
  };

  try {
    const response = await makeRequest();
    log("INFO", `API -> ${masterConfig.name || config.url}`, {
      time: timer,
      request: default_config,
      response: response.data,
    });
    return response.data;
  } catch (error) {
    if (
      error instanceof AxiosError &&
      masterConfig.shouldRetryStatus?.includes(error.response?.status) &&
      masterConfig.shouldRetry
    ) {
      try {
        if (masterConfig.retryFunction) {
          const token = await masterConfig.retryFunction();
          config.headers.Authorization = `Bearer ${token}`;
        }
        const retryResponse = await makeRequest();
        log("INFO", `API -> ${masterConfig.name || config.url}`, {
          time: timer,
          request: default_config,
          response: retryResponse.data,
        });
        return retryResponse.data;
      } catch (retryError) {
        log("WARN", `Retry API -> ${masterConfig.name || config.url} failed`, {
          time: timer,
          request: default_config,
          response: retryError,
        });
        return Promise.reject(retryError?.response?.data);
      }
    } else {
      log("WARN", `API -> ${masterConfig.name || config.url} failed`, {
        time: timer,
        request: default_config,
        response: error,
      });
      return Promise.reject(error?.response);
    }
  } finally {
    clearInterval(interval);
  }
};

export default axiosMaster;
