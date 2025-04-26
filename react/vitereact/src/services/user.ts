import { ExpressUrl } from "@/global";
import axios from "@/utils/axios";
import cookie from "@/utils/cookie";

export type User = {
  user_id: number;
  user_name: string;
  token: string;
};

export type LoginParams = {
  username: string;
  password: string;
};

export type UserInfo = {
  code: number;
  name: string;
  user: {
    name: string;
    user_id: number;
  }
}

export type LogoutStatus = {
  status: boolean;
};

export type AdminInfo = {
  name: string;
  value: string | string[];
  sync: boolean;
};

const getUserFromCookie = (): User | null => {
  const { user_id, user_name, token } = cookie.getAll();

  if (!user_id || !user_name || !token) return null;

  return {
    user_id: Number(user_id),
    user_name,
    token
  };
};

export const getAdminUsers = async () => "userly";
const getUserFromLocalStorage = (): User | null => {
  const user = localStorage.getItem("user/info") ?? "null";
  return JSON.parse(user);
};

export const getToken = () => localStorage.getItem("token");
export const setToken = (token: string) => localStorage.setItem("token", token);


export const getUser = () => getUserFromCookie() ?? getUserFromLocalStorage();

export async function getUserInfo() {
  const token = getToken();
  if (!token) {
    throw new Error("User not found!");
  }
  const result = await axios.get<{data:UserInfo}>(`${ExpressUrl}/user-api/currentUser`);
  return result.data.data;
}

export async function login(body: any) {
  return axios.post(`${ExpressUrl}/user-api/login`, body);
}