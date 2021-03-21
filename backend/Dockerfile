# Build stage 1. Typescript Build
FROM node:12.16.3-alpine AS build
ARG BUILD_DEPS="git g++ cmake make python2"

WORKDIR /usr/src/app
RUN apk add --no-cache --update --virtual build_deps $BUILD_DEPS

COPY ./package*.json ./
COPY ./tsconfig.json ./
RUN npm ci
COPY ./src ./src
RUN mkdir /usr/src/app/dist
RUN npm run build
RUN npm prune --production
RUN apk del build_deps

# Build stage 2. Deploy Image
FROM node:12.20.1-alpine3.11

EXPOSE 4000

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/dist ./

USER node

CMD ["node", "./server.js"]