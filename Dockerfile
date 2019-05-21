FROM node:12.2.0-alpine
WORKDIR /service/
ADD package.json ./
ADD package-lock.json ./
RUN npm install
ADD . ./

# CMD ["ls","-la", "./node_modules"]
CMD ["node", "server.js"]
