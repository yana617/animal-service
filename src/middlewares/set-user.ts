import { authServiceApi } from '../api/authService';

export const setUser = async (req, res, next): Promise<void> => {
    const user = await authServiceApi.getUser(req.token);
    req.user = user;
    next();
};
