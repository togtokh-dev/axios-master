import { AxiosRequestConfig } from "axios";
export declare const axiosMaster: (name?: any, log?: boolean, default_config?: any, time?: any) => Promise<any>;
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
export default axiosMaster;
