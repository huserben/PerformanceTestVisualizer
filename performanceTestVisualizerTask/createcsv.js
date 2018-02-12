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
const shell = require("shelljs");
function createCsvFiles(authenticationMethod, username, password, server, testRunName, outputFolder, numberOfItemsToFetch, failIfThresholdExceeded, exceedThreshold) {
    return __awaiter(this, void 0, void 0, function* () {
        var service = new tfsRestService.TfsRestService();
        service.initialize(authenticationMethod, username, password, server, true);
        cleanOutputFolder(outputFolder);
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
        if (writeCsvFiles(outputFolder, testCaseDictionary, failIfThresholdExceeded, exceedThreshold)) {
            throw new Error("At least one test did exceed the set threshold");
        }
    });
}
exports.createCsvFiles = createCsvFiles;
function pad2(input) {
    var formattedNumber = ("0" + input).slice(-2);
    return formattedNumber;
}
function cleanOutputFolder(folder) {
    deleteFolderRecursive(folder);
    /*fs.mkdir(folder, function (err: Error): void {
        if (err != null) {
            console.log(err);
        }
    });*/
    shell.mkdir('-p', folder);
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
function writeCsvFiles(outputFolder, testCaseDictionary, failIfThresholdExceeded, exceedThreshold) {
    const Delimeter = ",";
    const NewLine = "\r\n";
    var hasErrors = false;
    for (let testCaseTitle in testCaseDictionary) {
        if (testCaseDictionary.hasOwnProperty(testCaseTitle)) {
            let testResultsByTestCase = testCaseDictionary[testCaseTitle];
            console.log("------------------------------");
            console.log(`Test Name: ${testCaseTitle}`);
            var csvFileString = "";
            var lastTestRunDuration = NaN;
            var secondLastTestRunDuration = NaN;
            for (let testDate in testResultsByTestCase) {
                if (testResultsByTestCase.hasOwnProperty(testDate)) {
                    secondLastTestRunDuration = lastTestRunDuration;
                    var testDuration = testResultsByTestCase[testDate];
                    if (Number.isNaN(testDuration) || testDuration === undefined) {
                        // if there is no value for a testcase on a certain date we set it to null...
                        testDuration = 0;
                    }
                    lastTestRunDuration = testDuration;
                    csvFileString += `${testDate}${Delimeter}${testDuration}${NewLine}`;
                    console.log(`${testDate} - Ran for ${testDuration} seconds`);
                }
            }
            if (failIfThresholdExceeded && !Number.isNaN(lastTestRunDuration) && !Number.isNaN(secondLastTestRunDuration)) {
                console.log(`Checking if ${testCaseTitle} has exceeded threshold of ${exceedThreshold}% in last test...`);
                if (lastTestRunDuration <= 0 || secondLastTestRunDuration <= 0) {
                    console.log(`Either the last or previous test run was inconclusive (Run Duration = 0 seconds). Skipping check.`);
                }
                else {
                    var absoluteThreshold = secondLastTestRunDuration / 100 * (100 + exceedThreshold);
                    if (absoluteThreshold < lastTestRunDuration) {
                        console.error(`Last run of ${testCaseTitle} exceeded threshold.
                    Previous run took ${secondLastTestRunDuration} seconds - last run ${lastTestRunDuration} seconds.
                    Threshold set to ${exceedThreshold}% (${absoluteThreshold} seconds).`);
                        hasErrors = true;
                    }
                    else {
                        console.log(`Last run of ${testCaseTitle} has not exceeded threshold.`);
                    }
                }
            }
            fs.writeFile(`${outputFolder}/${testCaseTitle}.csv`, csvFileString, function (err) {
                if (err != null) {
                    console.log(err);
                }
            });
            console.log("------------------------------");
        }
    }
    return hasErrors;
}
//# sourceMappingURL=createcsv.js.map