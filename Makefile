dist-prod:
	ng build --prod
docker-build:
	docker build -t core-ui-nginx .
	docker tag core-ui-nginx:latest onepanel/core-ui:1.0.0-beta.1
docker-push:
	docker push onepanel/core-ui:1.0.0-beta.1
all: dist-prod docker-build docker-push
