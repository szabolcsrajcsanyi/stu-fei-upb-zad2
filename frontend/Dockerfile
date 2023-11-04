FROM node:18.16.1-bullseye

WORKDIR /app

COPY . .

ENV PATH /app/node_modules/.bin:$PATH

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start", "--disableHostCheck", "true"]