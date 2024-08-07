import ky from "ky";
import { toSearchParams } from "../utils/toSearchParams";
import type {
  APIResponse,
  CreateMeetRoomParams,
  GetMeetRoomListParams,
  GetUserListParams,
  LoginData,
  LoginUser,
  MeetRoom,
  MeetRoomListResponse,
  MenuItem,
  RefreshToken,
  RegisterUser,
  UpdateMeetingRoomParams,
  UpdatePasswordUser,
  UpdateUserEmail,
  UpdateUserInfo,
  UserInfo,
  UserListResponse,
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
          return await retryRequest(request);
        }

        return handleResponse(response);
      },
    ],
    beforeError: [
      async (error) => {
        const e = await error.response.json();
        throw new Error(e || "请求失败");
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
    .json<APIResponse<RefreshToken>>();

  localStorage.setItem("accessToken", _accessToken);
  localStorage.setItem("refreshToken", _refreshToken);
};

const retryRequest = async (request: Request) => {
  try {
    await refresh();
    const newAccessToken = localStorage.getItem("accessToken");
    if (newAccessToken) {
      request.headers.set("Authorization", `Bearer ${newAccessToken}`);
      const newResponse = await ky(request);
      return handleResponse(newResponse);
    }
  } catch (error) {
    console.error("Token 刷新失败：", error);
    throw new Error("Token 刷新失败");
  }
};

const handleResponse = async (response: Response) => {
  const data = await response.json();
  const desiredData = data.data;

  return new Response(JSON.stringify(desiredData), {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
};

// ------------------------------------------------------------------------------
export const login = async (data: LoginUser) => {
  return request.post("user/login", { json: data }).json<LoginData>();
};

export const register = async (data: RegisterUser) => {
  return request.post("user/register", { json: data }).json<string>();
};

export const getRegisterCaptcha = async (address: string) => {
  return request
    .get("user/register-captcha", { searchParams: { address } })
    .json<string>();
};

export const updatePassword = async (data: UpdatePasswordUser) => {
  return request.post("user/update_password", { json: data }).json<string>();
};

export const getUpdatePasswordCaptcha = async (address: string) => {
  return request
    .get("user/update_password/captcha", { searchParams: { address } })
    .json<string>();
};

export const getRoutes = async () => {
  return request.get("user/routes").json<MenuItem[]>();
};

export const getUserInfo = async () => {
  return request.get("user/info").json<UserInfo>();
};

export const getUpdateUserInfoCaptcha = async (address: string) => {
  return request
    .get("user/update/captcha", { searchParams: { address } })
    .json<string>();
};

export const updateUserInfo = async (data: UpdateUserInfo) => {
  return request.post("user/update", { json: data }).json<string>();
};

export const updateUserEmail = async (data: UpdateUserEmail) => {
  return request.post("user/update_email", { json: data }).json<string>();
};

export const getUpdateUserEmailCaptcha = async (address: string) => {
  return request
    .get("user/update_email/captcha", { searchParams: { address } })
    .json<string>();
};

export const upload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return request.post("user/upload", { body: formData }).json<string>();
};

export const getUserList = (data: GetUserListParams) => {
  return request
    .get("user/list", { searchParams: toSearchParams(data) })
    .json<UserListResponse>();
};

export const freezeUser = (id: number, isFreeze: 1 | 0) => {
  return request
    .get("user/freeze", { searchParams: { id, isFreeze } })
    .json<string>();
};

export const getMeetRoomList = (data: GetMeetRoomListParams) => {
  return request
    .get("meeting-room/list", {
      searchParams: toSearchParams(data),
    })
    .json<MeetRoomListResponse>();
};

export const getMeetRoom = (id: number) => {
  return request.get(`meeting-room/${id}`).json<MeetRoom>();
};

export const deleteMeetRoom = (id: number) => {
  return request.delete(`meeting-room/delete/${id}`).json<string>();
};

export const createMeetRoom = (data: CreateMeetRoomParams) => {
  return request.post(`meeting-room/create`, { json: data }).json<string>();
};

export const updateMeetRoom = (data: UpdateMeetingRoomParams) => {
  return request.put(`meeting-room/update`, { json: data }).json<string>();
};
