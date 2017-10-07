import tfsRestService = require("./tfsrestservice");
import tfsConstants = require("./tfsconstants");
import taskConstants = require("./taskconstants");

async function run(): Promise<void> {
    try {
        tfsRestService.initialize(
            taskConstants.AuthenticationMethodPersonalAccessToken,
            "whatever",
            "sww3otrtvfaqi4sqcqqjceq23lxgvlyjfoftqox7272qc3vxyi2q",
            "https://benjsawesometfstest.visualstudio.com/DefaultCollection/Build Test",
            false);

            var testRuns : tfsRestService.ITestRun[] = await tfsRestService.getTestRuns("CI Test", 3);

            for (let testRun of testRuns){
                console.log(`Getting test results of run...`);

                var testResults : tfsRestService.ITestResult[] = await tfsRestService.getTestResults(testRun);

                // add line chart magic here...
                for (let result of testResults){
                    console.log(`Test: ${result.testCaseTitle}`);
                    console.log(`Result: ${result.outcome}`);
                    console.log(`Ran for: ${result.durationInMs / 1000} seconds`);
                }

                console.log("--------------------------------");
            }

    } catch (err) {
        console.log(err);
    }
}

run();