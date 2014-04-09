
TESTS = test/*.test.js
REPORTER = dot

build:
	@component build

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--ui exports \
		--watch \
		--bail \
		--reporter $(REPORTER) \
		$(TESTS)

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
