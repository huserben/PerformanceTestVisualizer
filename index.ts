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

        var service: tfsRestService.ITfsRestService = new tfsRestService.TfsRestService();

        service.initialize(
            authenticationMethod,
            username,
            password,
            server,
            true);

        cleanOutputFolder();

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
        writeCsvFiles(testCaseDictionary);

    } catch (err) {
        console.log(err);
    }
}

function pad2(input: number): string {
    var formattedNumber: string = ("0" + input).slice(-2);
    return formattedNumber;
}

function cleanOutputFolder(): void {
    deleteFolderRecursive("performanceValues");

    fs.mkdir("performanceValues",  function (err: Error): void {
        if (err != null) {
            console.log(err);
        }
    });
}

function deleteFolderRecursive(path: string){
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

function writeCsvFiles(testCaseDictionary: { [name: string]: { [date: string]: number; }; }) {
    const Delimeter: string = ",";
    const NewLine: string = "\r\n";

    for (let testCaseTitle in testCaseDictionary) {
        if (testCaseDictionary.hasOwnProperty(testCaseTitle)) {

            let testResultsByTestCase: {
                [date: string]: number;
            } = testCaseDictionary[testCaseTitle];

            console.log("------------------------------");
            console.log(`Test Name: ${testCaseTitle}`);

            var csvFileString: string = "";

            for (let testDate in testResultsByTestCase) {
                if (testResultsByTestCase.hasOwnProperty(testDate)) {
                    var testDuration: number = testResultsByTestCase[testDate];
                    if (Number.isNaN(testDuration) || testDuration === undefined) {
                        // if there is no value for a testcase on a certain date we set it to null...
                        testDuration = 0;
                    }

                    csvFileString += `${testDate}${Delimeter}${testDuration}${NewLine}`;
                    console.log(`${testDate} - Ran for ${testDuration} seconds`);
                }
            }

            fs.writeFile(`performanceValues/${testCaseTitle}.csv`, csvFileString, function (err: Error): void {
                if (err != null) {
                    console.log(err);
                }
            });

            console.log("------------------------------");
        }
    }
}

run();