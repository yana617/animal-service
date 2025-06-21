import { ERRORS } from '../translates';

import { authServiceApi } from '../api/authService';

export const checkPermissions = (permissions: string[]) => async (req, res, next) => {
  try {
    const userPermissions = await authServiceApi.getPermissions(req.token);

    if (!permissions.every((p) => userPermissions.includes(p))) {
      return res.status(403).json({ success: false, error: ERRORS.FORBIDDEN });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, error: ERRORS.FORBIDDEN });
  }
};
