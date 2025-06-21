export const setToken = (req, res, next): void => {
  req.token = req.body.token || req.query.token || req.headers['x-access-token'];
  next();
};
