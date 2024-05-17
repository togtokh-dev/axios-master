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
exports.axiosMasterMain = exports.axiosMasterLogger = exports.axiosMaster = void 0;
const axios_1 = require("axios");
const https = require("https");
const axiosMaster = (name, log, default_config, time) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });
    const config = Object.assign({
        timeout: time ? time : 20 * 1000,
        httpsAgent: httpsAgent,
    }, default_config);
    const startTime = Date.now();
    let timer = 0;
    const interval = setInterval(function () {
        const elapsedTime = Date.now() - startTime;
        timer = (elapsedTime / 1000).toFixed(5);
    }, 1);
    try {
        const response = yield (0, axios_1.default)(config);
        clearInterval(interval);
        console.log("\x1b[32m", ": resolve");
        console.log("\x1b[33m", `${name ? name : config.url} => ${timer} s :`);
        if (log) {
            console.log(response === null || response === void 0 ? void 0 : response.data);
        }
        console.log("\x1b[32m", ": resolve");
        return Promise.resolve(response === null || response === void 0 ? void 0 : response.data);
    }
    catch (error) {
        clearInterval(interval);
        console.log("\x1b[35m", ": reject");
        console.log("\x1b[33m", `${name ? name : config.url} => ${timer} s :`);
        console.log((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
        console.log("\x1b[35m", ": reject");
        return Promise.reject((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data);
    }
});
exports.axiosMaster = axiosMaster;
const axiosMasterLogger = (default_config, masterConfig) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });
    const config = Object.assign({
        timeout: masterConfig.timeout ? masterConfig.timeout : 20 * 1000,
        httpsAgent: httpsAgent,
    }, default_config);
    const startTime = Date.now();
    let timer = 0;
    const interval = setInterval(function () {
        const elapsedTime = Date.now() - startTime;
        timer = (elapsedTime / 1000).toFixed(5);
    }, 1);
    let response_log = {};
    let response_type = "INFO";
    try {
        const response = yield (0, axios_1.default)(config);
        clearInterval(interval);
        console.log("\x1b[32m", ": resolve");
        console.log("\x1b[33m", `${masterConfig.name ? masterConfig.name : config.url} => ${timer} s :`);
        if (masterConfig.log) {
            console.log(response);
        }
        console.log("\x1b[32m", ": resolve");
        response_log = response === null || response === void 0 ? void 0 : response.data;
        return Promise.resolve(response === null || response === void 0 ? void 0 : response.data);
    }
    catch (error) {
        clearInterval(interval);
        if (masterConfig.log) {
            console.log(error);
        }
        response_log = error;
        response_type = "WARN";
        console.log("\x1b[35m", ": reject");
        console.log("\x1b[33m", `${masterConfig.name ? masterConfig.name : config.url} => ${timer} s :`);
        console.log((_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data);
        console.log("\x1b[35m", ": reject");
        return Promise.reject((_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.data);
    }
    finally {
        try {
            masterConfig === null || masterConfig === void 0 ? void 0 : masterConfig.logger({
                log_levels: "WARN",
                message: `API -> ${masterConfig.name ? masterConfig.name : config.url}`,
                json: {
                    time: timer,
                    request: default_config,
                    response: response_log,
                },
            });
        }
        catch (error) {
            console.log(error);
        }
    }
});
exports.axiosMasterLogger = axiosMasterLogger;
const axiosMasterMain = (default_config, masterConfig) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g;
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });
    const config = Object.assign({ timeout: masterConfig.timeout || 20000, httpsAgent: httpsAgent }, default_config);
    const startTime = Date.now();
    let timer = 0;
    const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        timer = parseFloat((elapsedTime / 1000).toFixed(5));
    }, 1);
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
            clearInterval(interval);
            console.log("\x1b[32m", ": resolve");
            console.log("\x1b[33m", `${masterConfig.name || config.url} => ${timer} s :`);
            if (masterConfig.log) {
                console.log(response);
            }
            console.log("\x1b[32m", ": resolve");
            return response;
        }
        catch (error) {
            clearInterval(interval);
            if (masterConfig.log) {
                console.log(error);
            }
            console.log("\x1b[35m", ": reject");
            console.log("\x1b[33m", `${masterConfig.name || config.url} => ${timer} s :`);
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
            time: timer,
            request: default_config,
            response: response.data,
        });
        return response.data;
    }
    catch (error) {
        if (error instanceof axios_1.AxiosError &&
            masterConfig.shouldRetryStatus.includes((_e = error.response) === null || _e === void 0 ? void 0 : _e.status) &&
            masterConfig.shouldRetry) {
            try {
                if (masterConfig.retryFunction) {
                    const token = yield masterConfig.retryFunction();
                    config.headers.Authorization = `Bearer ${token}`;
                }
                const retryResponse = yield makeRequest();
                log("INFO", `API -> ${masterConfig.name || config.url}`, {
                    time: timer,
                    request: default_config,
                    response: retryResponse.data,
                });
                return retryResponse.data;
            }
            catch (retryError) {
                log("WARN", `Retry API -> ${masterConfig.name || config.url} failed`, {
                    time: timer,
                    request: default_config,
                    response: retryError,
                });
                return Promise.reject((_f = retryError === null || retryError === void 0 ? void 0 : retryError.response) === null || _f === void 0 ? void 0 : _f.data);
            }
        }
        else {
            log("WARN", `API -> ${masterConfig.name || config.url} failed`, {
                time: timer,
                request: default_config,
                response: error,
            });
            return Promise.reject((_g = error === null || error === void 0 ? void 0 : error.response) === null || _g === void 0 ? void 0 : _g.data);
        }
    }
    finally {
        clearInterval(interval);
    }
});
exports.axiosMasterMain = axiosMasterMain;
exports.default = exports.axiosMaster;
