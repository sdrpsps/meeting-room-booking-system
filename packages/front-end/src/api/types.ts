export interface Response<T> {
  code: number;
  data: T;
  message: string;
}

export interface LoginUser {
  userName: string;
  password: string;
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

export interface RegisterUser {
  userName: string;
  password: string;
  nickName: string;
  email: string;
  captcha: string;
}