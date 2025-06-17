import axiosMaster, { axiosMasterMain, AxiosMasterError } from "../src";
import axios, { AxiosError, AxiosResponse } from "axios";
type ApiResponse<T> = {
  success: boolean;
  data: T;
};
const API_HOST = "https://data.fixer.io/api/latest/";
const API_PASSWORD = "xxxxxxxxxxxxxxxxx";
const API_USERNAME = "xxxxxxxxxxxxxxxxx";

export const callExample = async (
  id: string,
): Promise<{
  success: boolean;
  message: string;
  data: any;
}> => {
  try {
    const res: ApiResponse<{}> = await axiosMasterMain(
      {
        method: "GET",
        url: `${API_HOST}/login`,
        auth: {
          username: API_PASSWORD,
          password: API_USERNAME,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${API_PASSWORD}:${API_USERNAME}`,
          ).toString("base64")}`,
        },
        params: {
          searchKey: "id",
          searchValue: id,
        },
      },
      {
        name: "GER LOGIN",
        timeout: 40000,
        logger(data) {
          console.log(data.json);
          // console.log(data.json.response);
        },
      },
    );
    if (res?.success) {
      return {
        success: true,
        message: "Амжилттай.",
        data: res.data,
      };
    }

    return {
      success: false,
      message: "Амжилтгүй.",
      data: null,
    };
  } catch (error) {
    const axiosError = error as AxiosError<{}>;
    console.log(
      "axiosError.data",
      axiosError.response,
      axiosError.response?.status,
      axiosError.response?.statusText,
    );
    return {
      success: false,
      message: axiosError?.code || "An error occurred.",
      data: null,
    };
  }
};
callExample("test");
