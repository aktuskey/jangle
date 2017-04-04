FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --silent
RUN npm install -g elm --silent

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
