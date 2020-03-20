FROM node:13.10.1 AS builder

RUN npm install -g @angular/cli@8.3.22

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN node set-env.js && ng build --prod

FROM nginx
COPY --from=builder /usr/src/app/dist/onepanel-core-ui /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 4200 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
