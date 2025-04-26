import { APIError } from "@/services";
import { message } from "antd";
import axios, { type AxiosError } from "axios";
import { isNil, omitBy } from "lodash-es";

const serializer = (params: Record<string, any>) =>
  new URLSearchParams(omitBy(params, isNil)).toString();

const instance = axios.create({
  headers: {
    "Content-Type": "application/json"
  },
  paramsSerializer: {
    serialize: serializer
  }
});

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    message.error(error.message);
    console.debug("[gplt]", error);
    return Promise.reject(
      new APIError(
        error.message,
        error.response?.status ?? -1,
        error.response?.statusText ?? "",
        error.response?.data ?? {},
        error
      )
    );
  }
);

export default instance;
