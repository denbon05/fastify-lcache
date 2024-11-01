# run all CI checks
all: build lint test

ci:
	npm ci

test:
	npm test

cover:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

format:
	npx prettier --write .

fix: format
	npx eslint --fix .

build:
	npm run build

PHONY: test
