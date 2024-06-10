import { ERRORS } from '../translates';

import { authServiceApi } from '../api/authService';

export const authRequired = async (req, res, next) => {
  try {
    if (!req.token) {
      return res
        .status(403)
        .json({ success: false, error: ERRORS.TOKEN_REQUIRED });
    }

    try {
      await authServiceApi.checkAuth(req.token);
    } catch (e) {
      return res
        .status(401)
        .json({ success: false, error: ERRORS.AUTH_REQUIRED });
    }

    next();
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: ERRORS.AUTH_REQUIRED });
  }
};
