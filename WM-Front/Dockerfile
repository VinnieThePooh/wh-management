#build stage for a Node.js application
#FROM node:lts-alpine as build-stage
#WORKDIR /app
#COPY ./ClientApp/package*.json ./  
#RUN npm install -g npm@latest && \
#    npm install && \
#    npm install -g @angular/cli
#COPY ./ClientApp/* ./
#RUN ng build #--configuration production - doesn't work   FAILED HERE!!
#COPY dist/client-app/browser/* /app/dist

# to run:
# docker build -t wh.spa - in docker dir
# делаем ход конем, предварительно выполнив команду ng build --configuration production у себя локально
FROM nginx:stable-alpine as production-stage

COPY ./dist/wm-client/browser/*  /usr/share/nginx/html/
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]