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
const jsonwebtoken_1 = require("jsonwebtoken");
const config = {
    keys: {
        TestToken: "tokenkey-1",
    },
};
const create = ({ data, expiresIn, keyName }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (config.keys[keyName] == undefined) {
            throw "Key undefined";
        }
        const JWT_KEY = config.keys[keyName];
        const jsontoken = yield (0, jsonwebtoken_1.sign)({ authMaster: data }, JWT_KEY, {
            expiresIn: expiresIn,
        });
        return Promise.resolve({
            success: true,
            message: "success",
            data: jsontoken,
        });
    }
    catch (error) {
        return Promise.resolve({
            success: false,
            message: error,
            data: null,
        });
    }
});
const checker = ({ token, keyName }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (config.keys[keyName] == undefined) {
            throw "Key undefined";
        }
        const JWT_KEY = config.keys[keyName];
        const decoded = yield (0, jsonwebtoken_1.verify)(token, JWT_KEY);
        return Promise.resolve({
            success: true,
            message: "success",
            data: decoded,
        });
    }
    catch (error) {
        return Promise.resolve({
            success: false,
            message: error,
            data: null,
        });
    }
});
const basic = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token_auth = token === null || token === void 0 ? void 0 : token.split(" ");
        if (token_auth[0] == "Basic") {
            const token = yield Buffer.from(token_auth[1], "base64").toString();
            return {
                success: true,
                data: {
                    username: token.split(":")[0],
                    password: token.split(":")[1],
                },
            };
        }
        return {
            success: false,
            data: null,
        };
    }
    catch (error) {
        return {
            success: false,
            data: null,
        };
    }
});
const checkTokenBearer = (users, options) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token_auth = req === null || req === void 0 ? void 0 : req.get("authorization");
            const token_cookie = req === null || req === void 0 ? void 0 : req.cookies.token;
            let token = undefined;
            if (token_auth) {
                token = token_auth;
                token = token === null || token === void 0 ? void 0 : token.slice(7);
            }
            else if (token_cookie) {
                token = token_cookie;
            }
            for (let index = 0; index < users.length; index++) {
                const user = users[index];
                const result = yield checker({
                    token: token,
                    keyName: user,
                });
                if (result.success) {
                    req.authMaster = result.data.authMaster;
                    req._id = result.data.authMaster._id;
                    req.user_id = result.data.authMaster.user_id;
                    req.role = result.data.authMaster.user_role;
                    req.user = result.data.authMaster.result;
                    req.tokenUser = user;
                    req.token = token;
                    next();
                }
            }
            if ((options === null || options === void 0 ? void 0 : options.required) == true) {
                return res.status(400).json({
                    success: false,
                    message: "Нэвтрэх шаардлагатай",
                });
            }
            else {
                next();
            }
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: "Нэвтрэх шаардлагатай",
            });
        }
    });
};
const checkTokenBasic = ({ required }) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token_auth = req.get("authorization");
        const token_cookie = req.cookies.token;
        let token = undefined;
        if (token_auth) {
            token = token_auth;
            token = token.slice(7);
        }
        else if (token_cookie) {
            token = token_cookie;
        }
        const result = yield basic(token);
        if (result.success) {
            req.authMaster = result.data;
            req.tokenUser = "basicToken";
            next();
        }
        else if (required) {
            return res.status(400).json({
                success: false,
                message: "Нэвтрэх шаардлагатай",
            });
        }
        else {
            next();
        }
    });
};
exports.default = { create, checker, config, checkTokenBearer, checkTokenBasic };
