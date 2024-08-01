import ky from "ky";
import type {
  LoginData,
  LoginUser,
  MenuItem,
  RefreshToken,
  RegisterUser,
  Response,
  UpdatePasswordUser,
  UpdateUserEmail,
  UpdateUserInfo,
  UserInfo,
} from "./types";

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
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401) {
          try {
            await refresh();
            const newAccessToken = localStorage.getItem("accessToken");
            if (newAccessToken) {
              // 重试原始请求
              request.headers.set("Authorization", `Bearer ${newAccessToken}`);
              return ky(request);
            }
          } catch (refreshError) {
            console.error("Token refresh failed", refreshError);
            // 处理刷新失败逻辑，例如登出用户
            throw new Error("Token refresh failed, please log in again");
          }
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

const refresh = async () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  if (!accessToken || !refreshToken) throw new Error("未登录");

  const {
    data: { accessToken: _accessToken, refreshToken: _refreshToken },
  } = await ky
    .get(`${import.meta.env.VITE_API_ADDRESS}/user/refresh`, {
      searchParams: { refreshToken },
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .json<Response<RefreshToken>>();

  localStorage.setItem("accessToken", _accessToken);
  localStorage.setItem("refreshToken", _refreshToken);
};

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

export const updatePassword = async (data: UpdatePasswordUser) => {
  return request
    .post("user/update_password", { json: data })
    .json<Response<string>>();
};

export const getUpdatePasswordCaptcha = async (address: string) => {
  return request
    .get("user/update_password/captcha", { searchParams: { address } })
    .json<Response<string>>();
};

export const getRoutes = async () => {
  return request.get("user/routes").json<Response<MenuItem[]>>();
};

export const getUserInfo = async () => {
  return request.get("user/info").json<Response<UserInfo>>();
};

export const getUpdateUserInfoCaptcha = async (address: string) => {
  return request
    .get("user/update/captcha", { searchParams: { address } })
    .json<Response<string>>();
};

export const updateUserInfo = async (data: UpdateUserInfo) => {
  return request.post("user/update", { json: data }).json<Response<string>>();
};

export const updateUserEmail = async (data: UpdateUserEmail) => {
  return request
    .post("user/update_email", { json: data })
    .json<Response<string>>();
};

export const getUpdateUserEmailCaptcha = async (address: string) => {
  return request
    .get("user/update_email/captcha", { searchParams: { address } })
    .json<Response<string>>();
};

export const upload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return request
    .post("user/upload", { body: formData })
    .json<Response<string>>();
};
