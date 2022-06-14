test:
	npm test

cover:
	npm test -- --coverage --coverageProvider=v8

fix:
	npx eslint --fix .

build:
	npm run build

PHONY: test