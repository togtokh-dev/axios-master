import { AxiosRequestConfig, AxiosResponse } from "axios";
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
export declare const axiosMasterMain: (default_config: AxiosRequestConfig, masterConfig: MasterConfig) => Promise<AxiosResponse | any>;
export declare const axiosMasterLogger: (default_config: AxiosRequestConfig, masterConfig: MasterConfig) => Promise<AxiosResponse | any>;
export default axiosMasterMain;
