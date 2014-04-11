
build:
	@component build

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--ui exports \
		--watch \
		--bail

docs:
	@./bin/pilot \
	  --verbose \
	  lib/* \
	  --out docs \
	  --title pilot \
	  --github visionmedia/pilot \
	  --index index.md

doc-server:
	@./bin/pilot \
		--server docs

.PHONY: test docs build
