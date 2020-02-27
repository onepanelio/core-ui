FROM nginx

COPY ./dist/onepanel-core-ui /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 4200 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
