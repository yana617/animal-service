FROM node:18.16.0
LABEL maintainer="jana.ru.sidorova@yandex.by"
ENV NODE_ENV=production PORT=1083

WORKDIR /usr/src/animal-service

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 1083

COPY ./bin/prod-docker-entrypoint.sh /bin/prod-docker-entrypoint.sh

RUN chmod +x /bin/prod-docker-entrypoint.sh

ENTRYPOINT ["/bin/prod-docker-entrypoint.sh"]