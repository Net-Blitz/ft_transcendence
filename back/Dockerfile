FROM node:alpine

WORKDIR "/app"

COPY ./package*.json ./

RUN npm ci

COPY . .

RUN npx nest build --webpack

ENTRYPOINT [ "npm", "run", "start:dev"]
