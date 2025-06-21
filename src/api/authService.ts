import axios from 'axios';

import { ERRORS } from '../translates';
import { AUTH_SERVICE_URL } from '../constant/auth-service-url';

type RequestParams = {
    method: string;
    url: string;
    token: string;
    body?: Record<string, any>;
};

const request = async ({ method, url, token, body }: RequestParams): Promise<any> => {
    try {
        const response = await axios({
            method,
            url: `${AUTH_SERVICE_URL}${url}`,
            data: body,
            headers: { 'x-access-token': token },
        });
        return response.data.data;
    } catch (err) {
        throw new Error(ERRORS.EXTERNAL_SERVICE_ERROR);
    }
};

const get = async ({ url, token }: Pick<RequestParams, 'url' | 'token'>): Promise<any> =>
    await request({ method: 'GET', url, token });

// const post = async ({ url, body, token }: Omit<RequestParams, 'method'>): Promise<any> =>
//     await request({
//         method: 'POST',
//         body,
//         url,
//         token,
//     });

const checkAuth = async (token): Promise<void> => await get({ url: '/auth', token });

const getPermissions = async (token): Promise<string[]> => await get({ url: '/permissions/me', token });

export const authServiceApi = {
    checkAuth,
    getPermissions,
};
