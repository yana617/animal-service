const { DOCKER_AUTH_SERVICE_URL } = process.env;

export const AUTH_SERVICE_URL = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;
