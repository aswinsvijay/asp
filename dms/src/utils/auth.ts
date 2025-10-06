import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { UNSAFE_CAST } from './typeUtils';
import { LoginResponse } from '../../server/types';

const authCookieKey = 'token';

interface AuthCookieValue {
  userId: string;
  password: string;
  token: string;
}

export async function login(userId: string, password: string) {
  const response = await axios({
    url: '/auth/login',
    method: 'post',
    data: {
      userId,
      password,
    },
  });

  const responseData = UNSAFE_CAST<LoginResponse>(response.data);

  const value: AuthCookieValue = {
    userId,
    password,
    token: responseData.token,
  };

  await setCookie(authCookieKey, JSON.stringify(value));
}

export async function getToken() {
  const value = await getCookie(authCookieKey);

  const parsedValue = UNSAFE_CAST<AuthCookieValue>(JSON.parse(value ?? '{}'));

  return {
    authToken: parsedValue.token,
    basic: Buffer.from(`${parsedValue.userId}:${parsedValue.password}`).toString('base64'),
  };
}

export async function logout() {
  await deleteCookie(authCookieKey);
}
