FROM node:current-slim

RUN npm install

COPY . .

CMD ["npm", "start"]