import axios from 'axios';

import { ERRORS } from '../translates';
import { AUTH_SERVICE_URL } from '../constant/auth-service-url';

type RequestParams = {
    method: string;
    url: string;
    token: string;
    body?: Record<string, any>;
};

const request = async ({ method, url, token, body }: RequestParams) => {
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

const get = async ({ url, token }: Pick<RequestParams, 'url' | 'token'>) =>
    request({ method: 'GET', url, token });

const post = async ({ url, body, token }: Omit<RequestParams, 'method'>) =>
    request({
        method: 'POST',
        body,
        url,
        token,
    });

const checkAuth = async (token) => get({ url: '/auth', token });

export const authServiceApi = {
    checkAuth,
};
