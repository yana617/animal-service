const { DOCKER_AUTH_SERVICE_URL } = process.env;

export const BASE_URL = `http://${DOCKER_AUTH_SERVICE_URL}/internal`;
