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
      console.log("\x1b[35m", ": reject");
      console.log(
        "\x1b[33m",
        `${masterConfig.name || config.url} => ${elapsedTime} s :`,
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
      time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
      request: default_config,
      response: response.data,
      responseBody: response.data,
      statusCode: response.status,
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
          time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
          request: default_config,
          response: retryResponse.data,
          responseBody: retryResponse.data,
          statusCode: retryResponse.status,
        });
        return retryResponse.data;
      } catch (retryError) {
        log("WARN", `Retry API -> ${masterConfig.name || config.url} failed`, {
          time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
          request: default_config,
          response: retryError,
          responseBody: retryError.data,
          statusCode: retryError.status,
        });
        return Promise.reject(retryError?.response?.data);
      }
    } else {
      log("WARN", `API -> ${masterConfig.name || config.url} failed`, {
        time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
        request: default_config,
        response: error,
        responseBody: error.data,
        statusCode: error.status,
      });
      return Promise.reject(error?.response);
    }
  }
};
export const axiosMasterLogger = axiosMasterMain;
export default axiosMasterMain;
