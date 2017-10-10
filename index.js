"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tfsRestService = require("./tfsrestservice.js");
const taskConstants = require("./taskconstants.js");
const fs = require("fs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // first two argumnents are different things...
            var authenticationMethod = process.argv[2];
            var username = process.argv[3];
            var password = process.argv[4];
            var server = process.argv[5];
            var buildDefinitionName = process.argv[6];
            var numberOfItemsToFetch = 10;
            if (process.argv.length > 6) {
                var numberOfItemsToFetchString = process.argv[7];
                numberOfItemsToFetch = parseInt(numberOfItemsToFetchString, 10);
            }
            tfsRestService.initialize(authenticationMethod, username, password, server, true);
            var testRuns = yield tfsRestService.getTestRuns(buildDefinitionName, numberOfItemsToFetch);
            var testCaseDictionary = {};
            var availableTestCases = [];
            for (let testRun of testRuns) {
                var testResults = yield tfsRestService.getTestResults(testRun);
                for (let result of testResults) {
                    if (result.outcome !== taskConstants.TestRunOutcomePassed) {
                        continue;
                    }
                    var date = new Date(result.startedDate);
                    var dateRun = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    if (!availableTestCases.some(x => x === result.testCaseTitle)) {
                        availableTestCases.push(result.testCaseTitle);
                    }
                    if (testCaseDictionary[dateRun] === undefined) {
                        testCaseDictionary[dateRun] = {};
                    }
                    testCaseDictionary[dateRun][result.testCaseTitle] = result.durationInMs / 1000;
                }
            }
            const Tab = "\t";
            const NewLine = "\r\n";
            var tsvFileString = `date${Tab}`;
            // write header
            for (let testCase of availableTestCases) {
                tsvFileString += `${testCase}${Tab}`;
            }
            tsvFileString += `${NewLine}`;
            for (let key in testCaseDictionary) {
                if (testCaseDictionary.hasOwnProperty(key)) {
                    let testResultsByDate = testCaseDictionary[key];
                    console.log("------------------------------");
                    console.log(`Test Date: ${key}`);
                    tsvFileString += `${key}${Tab}`;
                    for (let testCase of availableTestCases) {
                        if (testResultsByDate[testCase] === undefined) {
                            // if there is no value for a testcase on a certain date we set it to null...
                            testResultsByDate[testCase] = 0;
                        }
                        tsvFileString += `${testResultsByDate[testCase]}${Tab}`;
                        console.log(`${testCase} - Ran for ${testResultsByDate[testCase]} seconds`);
                    }
                    tsvFileString += `${NewLine}`;
                    console.log("------------------------------");
                }
            }
            fs.writeFile("performanceValues.tsv", tsvFileString, function (err) {
                if (err != null) {
                    console.log(err);
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    });
}
run();
