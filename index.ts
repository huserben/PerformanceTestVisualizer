import tfsRestService = require("./tfsrestservice.js");
import taskConstants = require("./taskconstants.js");
import fs = require("fs");

async function run(): Promise<void> {
    try {
        tfsRestService.initialize(
            taskConstants.AuthenticationMethodPersonalAccessToken,
            "whatever",
            "sww3otrtvfaqi4sqcqqjceq23lxgvlyjfoftqox7272qc3vxyi2q",
            "https://benjsawesometfstest.visualstudio.com/DefaultCollection/Build Test",
            false);

        var testRuns: tfsRestService.ITestRun[] = await tfsRestService.getTestRuns("CI Test", 10);

        var testCaseDictionary: { [date: string]: { [name: string]: number } } = {};
        var availableTestCases: string[] = [];

        for (let testRun of testRuns) {
            var testResults: tfsRestService.ITestResult[] = await tfsRestService.getTestResults(testRun);

            for (let result of testResults) {
                if (result.outcome !== taskConstants.TestRunOutcomePassed) {
                    continue;
                }

                var date: Date = new Date(result.startedDate);
                var dateRun: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                if (!availableTestCases.some(x => x === result.testCaseTitle)) {
                    availableTestCases.push(result.testCaseTitle);
                }

                if (testCaseDictionary[dateRun] === undefined) {
                    testCaseDictionary[dateRun] = {};
                }

                testCaseDictionary[dateRun][result.testCaseTitle] = result.durationInMs / 1000;
            }
        }

        const Tab: string = "\t";
        const NewLine: string = "\r\n";
        var tsvFileString: string = `date${Tab}`;

        // write header
        for (let testCase of availableTestCases) {
            tsvFileString += `${testCase}${Tab}`;
        }

        tsvFileString += `${NewLine}`;

        for (let key in testCaseDictionary) {
            if (testCaseDictionary.hasOwnProperty(key)) {
                let testResultsByDate: { [name: string]: number } = testCaseDictionary[key];


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


        fs.writeFile("performanceValues.tsv", tsvFileString, function (err: Error) {
            if (err != null) {
                console.log(err);
            }
        });

    } catch (err) {
        console.log(err);
    }
}

run();