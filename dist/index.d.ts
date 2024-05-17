import { AxiosRequestConfig } from "axios";
interface MasterConfig {
    name?: string;
    log?: boolean;
    timeout?: number;
    logger?: (data: {
        log_levels: "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL" | "TRACE" | string;
        message: string;
        json: Object;
    }) => void;
    retry?: boolean;
    shouldRetry?: boolean;
    shouldRetryStatus?: number[];
    retryFunction?: () => Promise<string>;
}
export declare const axiosMaster: (name?: string | number, log?: boolean, default_config?: any, time?: number | string) => Promise<any>;
export declare const axiosMasterLogger: (default_config: AxiosRequestConfig, masterConfig: {
    name?: string;
    log?: boolean;
    timeout?: number;
    logger?: (data: {
        log_levels: string | "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL" | "TRACE";
        message: string;
        json: Object;
    }) => void;
}) => Promise<any>;
export declare const axiosMasterMain: (default_config: AxiosRequestConfig, masterConfig: MasterConfig) => Promise<any>;
export default axiosMaster;
