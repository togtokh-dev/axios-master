import { Request, Response, NextFunction } from "express";
import { sign, verify } from "jsonwebtoken";
import {
  createType,
  configType,
  ckeckerType,
  optionsType,
  authMasterRequest,
} from "./types";
const config: configType = {
  keys: {
    TestToken: "tokenkey-1",
  },
};
const create = async ({ data, expiresIn, keyName }: createType) => {
  try {
    if (config.keys[keyName] == undefined) {
      throw "Key undefined";
    }
    const JWT_KEY = config.keys[keyName];
    const jsontoken = await sign({ authMaster: data }, JWT_KEY, {
      expiresIn: expiresIn,
    });
    return Promise.resolve({
      success: true,
      message: "success",
      data: jsontoken,
    });
  } catch (error) {
    return Promise.resolve({
      success: false,
      message: error,
      data: null,
    });
  }
};
const checker = async ({ token, keyName }: ckeckerType) => {
  try {
    if (config.keys[keyName] == undefined) {
      throw "Key undefined";
    }
    const JWT_KEY = config.keys[keyName];
    const decoded = await verify(token, JWT_KEY);
    return Promise.resolve({
      success: true,
      message: "success",
      data: decoded,
    });
  } catch (error) {
    return Promise.resolve({
      success: false,
      message: error,
      data: null,
    });
  }
};
const basic = async (token: any) => {
  try {
    const token_auth = token?.split(" ");
    if (token_auth[0] == "Basic") {
      const token = await Buffer.from(token_auth[1], "base64").toString();
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
  } catch (error) {
    return {
      success: false,
      data: null,
    };
  }
};
const checkTokenBearer = (users: [string], options?: optionsType) => {
  return async (req: authMasterRequest, res: Response, next: NextFunction) => {
    try {
      const token_auth = req?.get("authorization");
      const token_cookie = req?.cookies.token;
      let token = undefined;
      if (token_auth) {
        token = token_auth;
        token = token?.slice(7);
      } else if (token_cookie) {
        token = token_cookie;
      }
      for (let index = 0; index < users.length; index++) {
        const user: any = users[index];
        const result = await checker({
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
      if (options?.required == true) {
        return res.status(400).json({
          success: false,
          message: "Нэвтрэх шаардлагатай",
        });
      } else {
        next();
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Нэвтрэх шаардлагатай",
      });
    }
  };
};
const checkTokenBasic = ({ required }: { required?: Boolean }) => {
  return async (req: authMasterRequest, res: Response, next: NextFunction) => {
    const token_auth = req.get("authorization");
    const token_cookie = req.cookies.token;
    let token = undefined;
    if (token_auth) {
      token = token_auth;
      token = token.slice(7);
    } else if (token_cookie) {
      token = token_cookie;
    }
    const result = await basic(token);
    if (result.success) {
      req.authMaster = result.data;
      req.tokenUser = "basicToken";
      next();
    } else if (required) {
      return res.status(400).json({
        success: false,
        message: "Нэвтрэх шаардлагатай",
      });
    } else {
      next();
    }
  };
};
export default { create, checker, config, checkTokenBearer, checkTokenBasic };
