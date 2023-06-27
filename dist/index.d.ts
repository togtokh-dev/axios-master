import { Response, NextFunction } from "express";
import { createType, configType, ckeckerType, optionsType, authMasterRequest } from "./types";
declare const _default: {
    create: ({ data, expiresIn, keyName }: createType) => Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
    checker: ({ token, keyName }: ckeckerType) => Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
    config: configType;
    checkTokenBearer: (users: [string], options?: optionsType) => (req: authMasterRequest, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    checkTokenBasic: ({ required }: {
        required?: Boolean;
    }) => (req: authMasterRequest, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
