FROM node:12.2.0-alpine
ADD . /service/
WORKDIR /service/
RUN npm install

CMD ["node", "server.js"]
