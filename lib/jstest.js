let tests = [];

const FAILED = "FAILED";
const PASSED = "PASSED";
const ERROR = "ERROR";

class TestError extends Error {
    constructor(message) {
        super(message);
        this.name = "TestError";
    }
}

class Test {
    constructor(name, testFunction) {
        this.name = name;
        this.testFunction = testFunction;
        this.run = false;
        this.result = null;
        this.message = null;
    }
}

function test(testName, testFunction) {
    tests.push(new Test(testName, testFunction));
}

function runTests() {
    tests.forEach(function(test) {
        try {
            test.testFunction();
            test.result = PASSED;
        } catch (e) {
            if (e instanceof TestError) {
                test.result = FAILED;
            } else {
                test.result = ERROR;
            }
            test.message = e.message;
        }
    });

    printResults();
}

function appendToBody(type, content) {
    element = document.createElement(type);
    element.innerHTML = content;
    document.body.appendChild(element);
    return element;
}

function printResults() {
    appendToBody("h1", "Test Results");
    document.createElement("p").innerHTML = "Total tests: " + tests.length;
    appendToBody("h2", "Summary");
    appendToBody("p", "Passed: " + tests.filter(function(test) {
        return test.result === PASSED;
    }).length);
    appendToBody("p", "Failed: " + tests.filter(function(test) {
        return test.result === FAILED;
    }).length);
    appendToBody("p", "Errored: " + tests.filter(function(test) {
        return test.result === ERROR;
    }).length);
    appendToBody("h2", "Details");
    output = appendToBody("dl", "");
    tests.forEach(function(test) {
        dt = document.createElement("dt")
        dt.innerHTML = test.name + ": " + test.result;
        output.appendChild(dt);
        if (test.result === FAILED || test.result === ERROR) {
            dd = document.createElement("dd")
            dd.innerHTML = test.message;
            output.appendChild(dd);
        }
    });
}

function fail(message) {
    throw new TestError(message);
}

function assert(condition, message) {
    if (!condition) {
        throw new TestError(message);
    }
}

function assertThrows(message, testFunction, expectedException = null, expectedMessage = null) {
    try {
        testFunction();
        throw new TestError(message);
    } catch (e) {
        if (e instanceof TestError) {
            throw e;
        }
        if (expectedException !== null && !(e instanceof expectedException)) {
            throw new TestError(message + " (expected exception: " + expectedException.name + ", got: " + typeof(e) + ")");
        }
        if (expectedMessage !== null && e.message !== expectedMessage) {
            throw new TestError(message + " (expected message: " + expectedMessage + ")");
        }
    }
}