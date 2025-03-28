"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosMasterLogger = exports.axiosMasterMain = void 0;
const axios_1 = require("axios");
const https = require("https");
const axiosMasterMain = (default_config, masterConfig) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });
    const config = Object.assign({ timeout: masterConfig.timeout || 20000, httpsAgent: httpsAgent }, default_config);
    const startTime = Date.now();
    const log = (level, message, data) => {
        if (masterConfig.logger) {
            masterConfig.logger({
                log_levels: level,
                message: message,
                json: data,
            });
        }
    };
    const makeRequest = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, axios_1.default)(config);
            const elapsedTime = parseFloat(((Date.now() - startTime) / 1000).toFixed(5));
            console.log("\x1b[32m", ": resolve");
            console.log("\x1b[33m", `${masterConfig.name || config.url} => ${elapsedTime} s :`);
            if (masterConfig.log) {
                console.log(response);
            }
            console.log("\x1b[32m", ": resolve");
            return response;
        }
        catch (error) {
            const elapsedTime = parseFloat(((Date.now() - startTime) / 1000).toFixed(5));
            if (masterConfig.log) {
                console.log(error);
            }
            console.log("\x1b[35m", ": reject");
            console.log("\x1b[33m", `${masterConfig.name || config.url} => ${elapsedTime} s :`);
            if (error instanceof axios_1.AxiosError && error.response) {
                console.log(error.response.data);
            }
            console.log("\x1b[35m", ": reject");
            throw error;
        }
    });
    try {
        const response = yield makeRequest();
        log("INFO", `API -> ${masterConfig.name || config.url}`, {
            time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
            request: default_config,
            response: response.data,
            responseBody: response.data,
            statusCode: response.status,
        });
        return response.data;
    }
    catch (error) {
        if (error instanceof axios_1.AxiosError &&
            ((_a = masterConfig.shouldRetryStatus) === null || _a === void 0 ? void 0 : _a.includes((_b = error.response) === null || _b === void 0 ? void 0 : _b.status)) &&
            masterConfig.shouldRetry) {
            try {
                if (masterConfig.retryFunction) {
                    const token = yield masterConfig.retryFunction();
                    config.headers.Authorization = `Bearer ${token}`;
                }
                const retryResponse = yield makeRequest();
                log("INFO", `API -> ${masterConfig.name || config.url}`, {
                    time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
                    request: default_config,
                    response: retryResponse.data,
                    responseBody: retryResponse.data,
                    statusCode: retryResponse.status,
                });
                return retryResponse.data;
            }
            catch (retryError) {
                log("WARN", `Retry API -> ${masterConfig.name || config.url} failed`, {
                    time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
                    request: default_config,
                    response: retryError,
                    responseBody: retryError.data,
                    statusCode: retryError.status,
                });
                return Promise.reject((_c = retryError === null || retryError === void 0 ? void 0 : retryError.response) === null || _c === void 0 ? void 0 : _c.data);
            }
        }
        else {
            log("WARN", `API -> ${masterConfig.name || config.url} failed`, {
                time: parseFloat(((Date.now() - startTime) / 1000).toFixed(5)),
                request: default_config,
                response: error,
                responseBody: error.data,
                statusCode: error.status,
            });
            return Promise.reject(error === null || error === void 0 ? void 0 : error.response);
        }
    }
});
exports.axiosMasterMain = axiosMasterMain;
exports.axiosMasterLogger = exports.axiosMasterMain;
exports.default = exports.axiosMasterMain;
