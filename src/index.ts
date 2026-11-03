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
export type AxiosMasterLoggerType = {
  log_levels: LogLevel;
  message: string;
  json: loggerJson;
};
// Config-ийг шууд объект эсвэл factory функц хэлбэрээр өгч болно.
// Factory өгвөл retry бүрт ШИНЭ config (шинэ FormData stream гэх мэт)
// үүсгэх тул stream-тэй POST хүсэлтүүд ч аюулгүй дахин явна.
export type AxiosMasterRequest =
  | AxiosRequestConfig
  | (() => AxiosRequestConfig | Promise<AxiosRequestConfig>);
interface MasterConfig {
  name?: string;
  log?: boolean;
  timeout?: number;
  logger?: (data: AxiosMasterLoggerType) => void;
  shouldRetry?: boolean;
  shouldRetryStatus?: number[];
  retryFunction?: () => Promise<string>;
}
export type AxiosMasterError<T = unknown, D = any> = AxiosError;

// axiosMasterMain болон axiosMasterLogger хоёрын ялгаа нь зөвхөн
// reject хийх утга тул нэг цөм функцээр шийднэ.
const axiosMasterCore = async (
  default_config: AxiosMasterRequest,
  masterConfig: MasterConfig,
  rejectMode: "response" | "error",
): Promise<AxiosResponse | any> => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  // Оролдлого бүрт шинэ config бүтээнэ (factory бол дахин дуудна)
  const buildConfig = async (
    overrideToken?: string,
  ): Promise<AxiosRequestConfig> => {
    const base =
      typeof default_config === "function"
        ? await default_config()
        : default_config;
    const config: AxiosRequestConfig = {
      timeout: masterConfig.timeout || 20000,
      httpsAgent: httpsAgent,
      ...base,
    };
    if (overrideToken) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${overrideToken}`,
      };
    }
    return config;
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

  const makeRequest = async (
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse> => {
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

  const name =
    masterConfig.name ||
    (typeof default_config === "function" ? "request" : default_config.url);

  try {
    const response = await makeRequest(await buildConfig());
    log("INFO", `API -> ${name}`, {
      time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
      request: default_config,
      response: response.data,
      responseBody: response.data,
      statusCode: response.status,
    });
    return response.data;
  } catch (error: any) {
    const isTimeout =
      axios.isAxiosError(error) &&
      (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT");
    if (
      error instanceof AxiosError &&
      masterConfig.shouldRetryStatus?.includes(error.response?.status) &&
      masterConfig.shouldRetry
    ) {
      try {
        let newToken: string | undefined;
        if (masterConfig.retryFunction) {
          // Token шинэчлэх — хоосон буцвал хуучин header-ээ хэвээр үлдээнэ
          const token = await masterConfig.retryFunction();
          if (token) newToken = token;
        }
        // Retry: config-ийг шинээр бүтээнэ (FormData гэх мэт stream дахин үүснэ)
        const retryResponse = await makeRequest(await buildConfig(newToken));
        log("INFO", `API -> ${name}`, {
          time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
          request: default_config,
          response: retryResponse.data || null,
          responseBody: isTimeout ? error.code : retryResponse.data,
          statusCode: retryResponse.status || null,
        });
        return retryResponse.data;
      } catch (retryError: any) {
        const isRetryTimeout =
          axios.isAxiosError(retryError) &&
          (retryError.code === "ECONNABORTED" ||
            retryError.code === "ETIMEDOUT");
        log("WARN", `Retry API -> ${name} failed`, {
          time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
          request: default_config,
          response: retryError.response || null,
          responseBody: isRetryTimeout
            ? retryError.code
            : retryError.response?.data,
          statusCode: retryError.status || null,
        });
        if (rejectMode === "response") {
          return Promise.reject(
            isRetryTimeout ? retryError : retryError.response,
          );
        }
        return Promise.reject(retryError);
      }
    } else {
      log("WARN", `API -> ${name} failed`, {
        time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
        request: default_config,
        response: error.response || null,
        responseBody: isTimeout ? error.code : error.response?.data,
        statusCode: error.status || null,
      });
      if (rejectMode === "response") {
        return Promise.reject(isTimeout ? error : error.response);
      }
      return Promise.reject(error);
    }
  }
};

export const axiosMasterMain = async (
  default_config: AxiosMasterRequest,
  masterConfig: MasterConfig,
): Promise<AxiosResponse | any> =>
  axiosMasterCore(default_config, masterConfig, "response");

export const axiosMasterLogger = async (
  default_config: AxiosMasterRequest,
  masterConfig: MasterConfig,
): Promise<AxiosResponse | any> =>
  axiosMasterCore(default_config, masterConfig, "error");

export default axiosMasterMain;
