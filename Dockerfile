# FROM node:current-slim

# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app

# COPY package.json .

# RUN npm install

# EXPOSE 8080

# ENV DB_URI "mongodb+srv://admin:hr-microservices-events@events-microservice.tb5qj.mongodb.net/test?retryWrites=true&w=majority"
# ENV DB_NAME "development"
# ENV PORT "8080"

# # CHANGE ME vv
# ENV RABBIT_HOST "172.17.0.2"

# COPY . .

# CMD ["npm", "start"]