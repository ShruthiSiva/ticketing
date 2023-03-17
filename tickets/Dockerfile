FROM node:16-alpine

WORKDIR /app
COPY package.json .
#The --only=prod flag allows you to only install the main dependencies and leave out the dev dependencies 
RUN npm install --only=prod

COPY . .
CMD ["npm", "start"]