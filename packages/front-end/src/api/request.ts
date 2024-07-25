import ky from "ky";
import type { LoginData, LoginUser, RegisterUser, Response } from "./types";

const request = ky.create({
  prefixUrl: import.meta.env.VITE_API_ADDRESS,
  timeout: 10000,
  retry: 0,
  hooks: {
    beforeRequest: [
      async (request) => {
        const jwt = localStorage.getItem("accessToken");

        if (jwt) {
          request.headers.set("Authorization", `Bearer ${jwt}`);
        }
      },
    ],
    beforeError: [
      async (error) => {
        const e = await error.response.json();
        throw new Error(e.data || "请求失败");
      },
    ],
  },
});

export const login = async (data: LoginUser) => {
  return request.post("user/login", { json: data }).json<Response<LoginData>>();
};

export const register = async (data: RegisterUser) => {
  return request.post("user/register", { json: data }).json<Response<string>>();
};

export const getRegisterCaptcha = async (address: string) => {
  return request
    .get("user/register-captcha", { searchParams: { address } })
    .json<Response<string>>();
};
