import axios from 'axios';
import { setCookie, deleteCookie } from 'cookies-next';
import { UNSAFE_CAST } from './typeUtils';
import { LoginResponse } from '../../server/types';

const tokenCookieKey = 'token';

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

  await setCookie(tokenCookieKey, responseData.token);
}

export async function logout() {
  await deleteCookie(tokenCookieKey);
}
