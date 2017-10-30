import tfsRestService = require("tfsrestservice");
import fs = require("fs");

async function run(): Promise<void> {
    try {
        // first two argumnents are different things...
        var authenticationMethod: string = process.argv[2];
        var username: string = process.argv[3];
        var password: string = process.argv[4];
        var server: string = process.argv[5];
        var testRunName: string = process.argv[6];

        var numberOfItemsToFetch: number = 10;
        if (process.argv.length > 6) {
            var numberOfItemsToFetchString: string = process.argv[7];
            numberOfItemsToFetch = parseInt(numberOfItemsToFetchString, 10);
        }

        var service : tfsRestService.ITfsRestService = new tfsRestService.TfsRestService();

        service.initialize(
            authenticationMethod,
            username,
            password,
            server,
            true);

        var testRuns: tfsRestService.ITestRun[] = await service.getTestRuns(testRunName, numberOfItemsToFetch);

        var testCaseDictionary: { [date: string]: { [name: string]: number } } = {};
        var availableTestCases: string[] = [];

        for (let testRun of testRuns) {
            var testResults: tfsRestService.ITestResult[] = await service.getTestResults(testRun);

            for (let result of testResults) {
                if (result.outcome !== tfsRestService.TestRunOutcomePassed) {
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


        fs.writeFile("performanceValues.tsv", tsvFileString, function (err: Error): void {
            if (err != null) {
                console.log(err);
            }
        });

    } catch (err) {
        console.log(err);
    }
}

run();