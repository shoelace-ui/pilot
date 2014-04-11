
build:
	component build

test:
	@./node_modules/.bin/mocha \
		--watch \
		--bail

lr:
	@lr \
	  'bin':'@touch test/index.js' \
	  'lib':'@touch test/index.js' \
	  'test/**.jade':'@touch test/index.js'
	  'test/**.styl':'@touch test/index.js'
	  'test/**.html':''

.PHONY: test docs build lr
