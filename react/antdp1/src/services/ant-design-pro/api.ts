// @ts-ignore
/* eslint-disable */
import { ExpressUrl } from '@/global';
import { request } from 'umi';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>(`${ExpressUrl}/user-api/currentUser`, {
    method: 'GET',
    headers: {
      'Authorization': localStorage.getItem('token') || '',
    },
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>(`${ExpressUrl}/user-api/logout`, {
    method: 'POST',
    headers: {
      'Authorization': localStorage.getItem('token') || '',
    },
    ...(options || {}),
  });
}

export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>(`${ExpressUrl}/user-api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function registAccount(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>(`${ExpressUrl}/user-api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}


export async function allUsers() {
  return request(`${ExpressUrl}/user-api/allusers`, {
    method: 'GET',
    headers: {
      'Authorization': localStorage.getItem('token') || '',
    },
  });
}

export async function deleteUser(body: { id: number }) {
  return request(`${ExpressUrl}/user-api/user`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token') || '',
    },
    data: body,
  });
}

export async function changeUserRole(body: API.User) {
  return request(`${ExpressUrl}/user-api/change_role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('token') || '',
    },
    data: body,
  });
}

export async function sendVerifyCodeToEmail(body: API.User) {
  return request(`${ExpressUrl}/user-api/send_verification_code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

export async function resetPassword(body: any) {
  return request(`${ExpressUrl}/user-api/reset_psw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}