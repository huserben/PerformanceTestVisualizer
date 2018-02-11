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
const tfsRestService = require("tfsrestservice");
const fs = require("fs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // first two argumnents are different things...
            var authenticationMethod = process.argv[2];
            var username = process.argv[3];
            var password = process.argv[4];
            var server = process.argv[5];
            var testRunName = process.argv[6];
            var numberOfItemsToFetch = 10;
            if (process.argv.length > 6) {
                var numberOfItemsToFetchString = process.argv[7];
                numberOfItemsToFetch = parseInt(numberOfItemsToFetchString, 10);
            }
            var service = new tfsRestService.TfsRestService();
            service.initialize(authenticationMethod, username, password, server, true);
            cleanOutputFolder();
            var testRuns = yield service.getTestRuns(testRunName, numberOfItemsToFetch);
            // group tests by testCase
            var testCaseDictionary = {};
            for (let testRun of testRuns) {
                var testResults = yield service.getTestResults(testRun);
                for (let result of testResults) {
                    if (result.outcome !== tfsRestService.TestRunOutcomePassed) {
                        continue;
                    }
                    var date = new Date(result.startedDate);
                    var dateRun = `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`;
                    if (testCaseDictionary[result.testCaseTitle] === undefined) {
                        testCaseDictionary[result.testCaseTitle] = {};
                    }
                    testCaseDictionary[result.testCaseTitle][dateRun] = result.durationInMs / 1000;
                }
            }
            writeCsvFiles(testCaseDictionary);
        }
        catch (err) {
            console.log(err);
        }
    });
}
function pad2(input) {
    var formattedNumber = ("0" + input).slice(-2);
    return formattedNumber;
}
function cleanOutputFolder() {
    deleteFolderRecursive("performanceValues");
    fs.mkdir("performanceValues", function (err) {
        if (err != null) {
            console.log(err);
        }
    });
}
function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            }
            else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}
;
function writeCsvFiles(testCaseDictionary) {
    const Delimeter = ",";
    const NewLine = "\r\n";
    for (let testCaseTitle in testCaseDictionary) {
        if (testCaseDictionary.hasOwnProperty(testCaseTitle)) {
            let testResultsByTestCase = testCaseDictionary[testCaseTitle];
            console.log("------------------------------");
            console.log(`Test Name: ${testCaseTitle}`);
            var csvFileString = "";
            for (let testDate in testResultsByTestCase) {
                if (testResultsByTestCase.hasOwnProperty(testDate)) {
                    var testDuration = testResultsByTestCase[testDate];
                    if (Number.isNaN(testDuration) || testDuration === undefined) {
                        // if there is no value for a testcase on a certain date we set it to null...
                        testDuration = 0;
                    }
                    csvFileString += `${testDate}${Delimeter}${testDuration}${NewLine}`;
                    console.log(`${testDate} - Ran for ${testDuration} seconds`);
                }
            }
            fs.writeFile(`performanceValues/${testCaseTitle}.csv`, csvFileString, function (err) {
                if (err != null) {
                    console.log(err);
                }
            });
            console.log("------------------------------");
        }
    }
}
run();
