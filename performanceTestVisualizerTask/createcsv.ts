import tfsRestService = require("tfsrestservice");
import fs = require("fs");
import shell = require("shelljs");

export async function createCsvFiles(
    authenticationMethod: string,
    username: string,
    password: string,
    server: string,
    testRunName: string,
    outputFolder: string,
    numberOfItemsToFetch: number,
    failIfThresholdExceeded: boolean,
    exceedThreshold: number
): Promise<void> {
    var service: tfsRestService.ITfsRestService = new tfsRestService.TfsRestService();

    service.initialize(
        authenticationMethod,
        username,
        password,
        server,
        true);

    cleanOutputFolder(outputFolder);

    var testRuns: tfsRestService.ITestRun[] = await service.getTestRuns(testRunName, numberOfItemsToFetch);

    // group tests by testCase
    var testCaseDictionary: { [name: string]: { [date: string]: number } } = {};

    for (let testRun of testRuns) {
        var testResults: tfsRestService.ITestResult[] = await service.getTestResults(testRun);

        for (let result of testResults) {
            if (result.outcome !== tfsRestService.TestRunOutcomePassed) {
                continue;
            }

            var date: Date = new Date(result.startedDate);
            var dateRun: string = `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`;

            if (testCaseDictionary[result.testCaseTitle] === undefined) {
                testCaseDictionary[result.testCaseTitle] = {};
            }

            testCaseDictionary[result.testCaseTitle][dateRun] = result.durationInMs / 1000;
        }
    }

    if (writeCsvFiles(outputFolder, testCaseDictionary, failIfThresholdExceeded, exceedThreshold)) {
        throw new Error("At least one test did exceed the set threshold");
    }
}

function pad2(input: number): string {
    var formattedNumber: string = ("0" + input).slice(-2);
    return formattedNumber;
}

function cleanOutputFolder(folder: string): void {
    deleteFolderRecursive(folder);

    /*fs.mkdir(folder, function (err: Error): void {
        if (err != null) {
            console.log(err);
        }
    });*/
    shell.mkdir('-p', folder);
}

function deleteFolderRecursive(path: string) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function writeCsvFiles(
    outputFolder: string,
    testCaseDictionary: { [name: string]: { [date: string]: number; }; },
    failIfThresholdExceeded: boolean,
    exceedThreshold: number): boolean {
    const Delimeter: string = ",";
    const NewLine: string = "\r\n";
    var hasErrors: boolean = false;

    for (let testCaseTitle in testCaseDictionary) {
        if (testCaseDictionary.hasOwnProperty(testCaseTitle)) {

            let testResultsByTestCase: {
                [date: string]: number;
            } = testCaseDictionary[testCaseTitle];

            console.log("------------------------------");
            console.log(`Test Name: ${testCaseTitle}`);

            var csvFileString: string = "";

            var lastTestRunDuration: number = NaN;
            var secondLastTestRunDuration: number = NaN;

            for (let testDate in testResultsByTestCase) {
                if (testResultsByTestCase.hasOwnProperty(testDate)) {
                    if (lastTestRunDuration !== 0) {
                        // only set previous value if the test was actually run...
                        secondLastTestRunDuration = lastTestRunDuration;
                    }

                    var testDuration: number = testResultsByTestCase[testDate];
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
                } else {
                    var absoluteThreshold: number = secondLastTestRunDuration / 100 * (100 + exceedThreshold);
                    if (absoluteThreshold < lastTestRunDuration) {
                        console.error(`Last run of ${testCaseTitle} exceeded threshold.
                    Previous run took ${secondLastTestRunDuration} seconds - last run ${lastTestRunDuration} seconds.
                    Threshold set to ${exceedThreshold}% (${absoluteThreshold} seconds).`);

                        hasErrors = true;
                    } else {
                        console.log(`Last run of ${testCaseTitle} has not exceeded threshold.`);
                    }
                }
            }

            fs.writeFile(`${outputFolder}/${testCaseTitle}.csv`, csvFileString, function (err: Error): void {
                if (err != null) {
                    console.log(err);
                }
            });

            console.log("------------------------------");
        }
    }

    return hasErrors;
}