FROM node:18-alpine

WORKDIR ./back-end
COPY ./back-end/package*.json ./
RUN npm install
COPY back-end/ ./
EXPOSE 3000
CMD ["npm", "start"]