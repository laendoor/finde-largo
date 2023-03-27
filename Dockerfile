# Building stage
FROM node:18-alpine as builder
WORKDIR /app

COPY package.json yarn.lock /app/
COPY tsconfig.json /app/
COPY src/ /app/src/

RUN yarn install --frozen-lockfile
RUN yarn build

# Preparing stage
FROM node:18-alpine as prod
ENV NODE_ENV=production
WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile
COPY --from=builder /app/dist/ /app/dist/

# Deployed stage
FROM node:18-alpine
RUN apk add --no-cache bash=~5

ENV NODE_ENV=production
WORKDIR /app

COPY --from=prod /app/ /app/

# ENTRYPOINT [ "bash" ]
CMD [ "yarn", "start" ]
