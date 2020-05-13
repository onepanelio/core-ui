COMMIT_HASH=$(shell git rev-parse --short HEAD)

api:
ifndef version
	err = $(error version is undefined)
	$(err)
endif
ifndef path
	err = $(error path is undefined)
	$(err)
endif
	rm -rf ./src/api
	mkdir -p ./src/api
	docker run --rm -v ${PWD}:/local -v ${path}:/local_in openapitools/openapi-generator-cli generate \
	    -p packageName=onepanel.core.api,projectName=onepanel.core.api,packageVersion=$(version) \
		-i /local_in \
		-g typescript-angular \
		-o /local/src/api

dist-prod:
	ng build --prod

docker-build:
	docker build -t onepanel-core-ui .
	docker tag onepanel-core-ui:latest onepanel/core-ui:$(COMMIT_HASH)

docker-push:
	docker push onepanel/core-ui:$(COMMIT_HASH)

docker: dist-prod docker-build docker-push
	docker build -t core-ui-nginx .
	docker tag core-ui-nginx:latest onepanel/core-ui:1.0.0-beta.1

docker-push:
	docker push onepanel/core-ui:1.0.0-beta.1

all: dist-prod docker-build docker-push
