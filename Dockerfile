FROM node:current-slim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]

COPY . .
