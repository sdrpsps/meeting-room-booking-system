import fetchWrapper from "./fetchWrapper";

export interface LoginUser {
  userName: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  data: LoginData;
  message: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
}

export interface UserInfo {
  avatar: null;
  email: string;
  id: number;
  isAdmin: boolean;
  isFrozen: boolean;
  name: string;
  nickName: string;
  permissions: string[];
  phoneNumber: null;
  role: string;
}

export function login(data: LoginUser): Promise<LoginResponse> {
  return fetchWrapper<LoginResponse>("/user/login", {
    method: "POST",
    body: data,
  });
}
