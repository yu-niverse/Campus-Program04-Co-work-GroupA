FROM node:21-alpine
WORKDIR /app
ADD ./server/ ./
RUN npm install
EXPOSE 5055
CMD [ "node", "app.js"]