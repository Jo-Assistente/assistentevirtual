FROM node:20-alpine

WORKDIR /backend

COPY package*.json ./

RUN apk update

RUN apk add --no-cache python3
RUN apk add --no-cache make
RUN apk add --no-cache g++
RUN apk add --no-cache git

ENV PYTHON=/usr/bin/python3

RUN npm install -g npm@latest

RUN npm install -g node-gyp@latest

RUN npm install

COPY . .

EXPOSE 9000

CMD ["npm", "run", "dev"]
