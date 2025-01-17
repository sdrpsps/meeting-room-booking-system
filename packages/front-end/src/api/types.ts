export interface APIResponse<T> {
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

export interface RefreshToken {
  accessToken: string;
  refreshToken: string;
}

export interface UpdatePasswordUser {
  email: string;
  password: string;
  captcha: string;
}

export interface MenuItem {
  key: string;
  icon?: string;
  label: string;
  children?: MenuItem[];
}

export interface UpdateUserInfo {
  avatar?: string;
  captcha: string;
  email: string;
  nickName?: string;
}

export interface UpdateUserEmail {
  email: string;
  newEmail: string;
  captcha: string;
}

export interface GetUserListParams {
  name: string;
  nickName: string;
  email: string;
  pageNum: number;
  pageSize: number;
}

export interface UserListResponse {
  list: User[];
  total: number;
}

export interface User {
  avatar: null | string;
  createdAt: string;
  email: string;
  id: number;
  isAdmin: boolean;
  isFrozen: boolean;
  name: string;
  nickName: string;
  phoneNumber: null;
  roleId: number;
  updatedAt: string;
}

export interface GetMeetRoomListParams {
  name: string;
  capacity: string;
  equipment: string;
  pageNum: number;
  pageSize: number;
}

export interface MeetRoomListResponse {
  list: MeetRoom[];
  total: number;
}

export interface MeetRoom {
  capacity: number;
  createdAt: string;
  description: string;
  equipment: string;
  id: number;
  isBooked: boolean;
  location: string;
  name: string;
  updatedAt: string;
}
export interface CreateMeetRoomParams {
  capacity: number;
  description: string;
  equipment: string;
  location: string;
  name: string;
}

export interface UpdateMeetingRoomParams extends CreateMeetRoomParams {
  id: number;
}
