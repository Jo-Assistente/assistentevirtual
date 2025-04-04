FROM node:20-alpine AS build

WORKDIR /frontend

COPY package.json .

RUN apk add --no-cache git

RUN npm install -g npm@latest

RUN npm uninstall react-scripts

RUN npm install -D react-scripts

ARG REACT_APP_API_URL

ARG REACT_APP_FORMS

ENV REACT_APP_API_URL=$REACT_APP_API_URL

ENV REACT_APP_FORMS=$REACT_APP_FORMS

COPY . .

RUN npm run build

# nginx 
FROM nginx:alpine3.18

WORKDIR /usr/share/nginx/html

RUN rm -rf *

COPY --from=build /frontend/build .

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
