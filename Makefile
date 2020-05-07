COMMIT_HASH=$(shell git rev-parse --short HEAD)

dist-prod:
	ng build --prod

docker-build:
	docker build -t onepanel-core-ui .
	docker tag onepanel-core-ui:latest onepanel/core-ui:$(COMMIT_HASH)

docker-push:
	docker push onepanel/core-ui:$(COMMIT_HASH)

docker: dist-prod docker-build docker-push
