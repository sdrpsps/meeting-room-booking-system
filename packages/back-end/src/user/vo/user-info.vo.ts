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

export class UserInfoVo implements UserInfo {
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
