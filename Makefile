TESTS = test/**/*Test.js test/**/**/*Test.js
REPORTER = Spec

testcoverage:
	istanbul cover --report html --dir ./reports _mocha -- -R spec $(TESTS)
test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
    		--require should \
    		--reporter $(REPORTER) \
    		--timeout 2000 \
    		--growl \
    		$(TESTS)

.PHONY: test
