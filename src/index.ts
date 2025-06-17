import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import * as https from "https";
type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL" | "TRACE";
type loggerJson = {
  time: number;
  request: AxiosRequestConfig | any;
  response: AxiosResponse | any;
  responseBody: JSON | any;
  statusCode: number | string;
};
interface MasterConfig {
  name?: string;
  log?: boolean;
  timeout?: number;
  logger?: (data: {
    log_levels: LogLevel;
    message: string;
    json: loggerJson;
  }) => void;
  shouldRetry?: boolean;
  shouldRetryStatus?: number[];
  retryFunction?: () => Promise<string>;
}
export type AxiosMasterError = AxiosError;
export const axiosMasterMain = async (
  default_config: AxiosRequestConfig,
  masterConfig: MasterConfig,
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

  const log = (level: LogLevel, message: string, data: loggerJson) => {
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
      const elapsedTime = parseFloat(
        ((Date.now() - startTime) / 1000).toFixed(5),
      );
      console.log("\x1b[32m", ": resolve");
      console.log(
        "\x1b[33m",
        `${masterConfig.name || config.url} => ${elapsedTime} s :`,
      );
      if (masterConfig.log) {
        console.log(response);
      }
      console.log("\x1b[32m", ": resolve");
      return response;
    } catch (error) {
      const elapsedTime = parseFloat(
        ((Date.now() - startTime) / 1000).toFixed(5),
      );
      if (masterConfig.log) {
        console.log(error);
      }
      const isTimeout =
        axios.isAxiosError(error) &&
        (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT");
      if (isTimeout) {
        console.log("\x1b[31m", "⚠️ Request timed out.");
      }
      console.log("\x1b[35m", ": reject");
      console.log(
        "\x1b[33m",
        `${masterConfig.name || config.url} => ${elapsedTime} s :`,
      );
      if (error instanceof AxiosError && error.response) {
        console.log(error.response?.data);
      }
      console.log("\x1b[35m", ": reject");
      throw error;
    }
  };

  try {
    const response = await makeRequest();
    log("INFO", `API -> ${masterConfig.name || config.url}`, {
      time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
      request: default_config,
      response: response.data,
      responseBody: response.data,
      statusCode: response.status,
    });
    return response.data;
  } catch (error) {
    const isTimeout =
      axios.isAxiosError(error) &&
      (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT");
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
          time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
          request: default_config,
          response: retryResponse.data || null,
          responseBody: isTimeout ? error.code : retryResponse.data,
          statusCode: retryResponse.status || null,
        });
        return retryResponse.data;
      } catch (retryError) {
        const isTimeout =
          axios.isAxiosError(retryError) &&
          (retryError.code === "ECONNABORTED" ||
            retryError.code === "ETIMEDOUT");
        log("WARN", `Retry API -> ${masterConfig.name || config.url} failed`, {
          time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
          request: default_config,
          response: retryError.response || null,
          responseBody: isTimeout ? retryError.code : retryError.response.data,
          statusCode: retryError.status || null,
        });
        return Promise.reject(isTimeout ? retryError : retryError.response);
      }
    } else {
      log("WARN", `API -> ${masterConfig.name || config.url} failed`, {
        time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
        request: default_config,
        response: error.response || null,
        responseBody: isTimeout ? error.code : error.response.data,
        statusCode: error.status || null,
      });
      return Promise.reject(isTimeout ? error : error.response);
    }
  }
};
export const axiosMasterLogger = async (
  default_config: AxiosRequestConfig,
  masterConfig: MasterConfig,
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

  const log = (level: LogLevel, message: string, data: loggerJson) => {
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
      const elapsedTime = parseFloat(
        ((Date.now() - startTime) / 1000).toFixed(5),
      );
      console.log("\x1b[32m", ": resolve");
      console.log(
        "\x1b[33m",
        `${masterConfig.name || config.url} => ${elapsedTime} s :`,
      );
      if (masterConfig.log) {
        console.log(response);
      }
      console.log("\x1b[32m", ": resolve");
      return response;
    } catch (error) {
      const elapsedTime = parseFloat(
        ((Date.now() - startTime) / 1000).toFixed(5),
      );
      if (masterConfig.log) {
        console.log(error);
      }
      const isTimeout =
        axios.isAxiosError(error) &&
        (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT");
      if (isTimeout) {
        console.log("\x1b[31m", "⚠️ Request timed out.");
      }
      console.log("\x1b[35m", ": reject");
      console.log(
        "\x1b[33m",
        `${masterConfig.name || config.url} => ${elapsedTime} s :`,
      );
      if (error instanceof AxiosError && error.response) {
        console.log(error.response?.data);
      }
      console.log("\x1b[35m", ": reject");
      throw error;
    }
  };

  try {
    const response = await makeRequest();
    log("INFO", `API -> ${masterConfig.name || config.url}`, {
      time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
      request: default_config,
      response: response.data,
      responseBody: response.data,
      statusCode: response.status,
    });
    return response.data;
  } catch (error) {
    const isTimeout =
      axios.isAxiosError(error) &&
      (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT");
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
          time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
          request: default_config,
          response: retryResponse.data || null,
          responseBody: isTimeout ? error.code : retryResponse.data,
          statusCode: retryResponse.status || null,
        });
        return retryResponse.data;
      } catch (retryError) {
        const isTimeout =
          axios.isAxiosError(retryError) &&
          (retryError.code === "ECONNABORTED" ||
            retryError.code === "ETIMEDOUT");
        log("WARN", `Retry API -> ${masterConfig.name || config.url} failed`, {
          time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
          request: default_config,
          response: retryError.response || null,
          responseBody: isTimeout ? retryError.code : retryError.response.data,
          statusCode: retryError.status || null,
        });
        return Promise.reject(isTimeout ? retryError : retryError);
      }
    } else {
      log("WARN", `API -> ${masterConfig.name || config.url} failed`, {
        time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
        request: default_config,
        response: error.response || null,
        responseBody: isTimeout ? error.code : error.response.data,
        statusCode: error.status || null,
      });
      return Promise.reject(isTimeout ? error : error);
    }
  }
};
export default axiosMasterMain;
