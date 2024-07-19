export interface UserInfo {
  id: number;
  name: string;
  nickName: string;
  email: string;
  avatar: string;
  phoneNumber: string;
  isFrozen: boolean;
  isAdmin: boolean;
  role: string;
  permissions: string[];
}

export class LoginUserVo {
  userInfo: UserInfo;
  accessToken: string;
  refreshToken: string;
}
