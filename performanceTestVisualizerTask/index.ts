import tl = require("vsts-task-lib/task");
import createCsv = require("./createcsv");

async function run(): Promise<void> {
    try {

        var oAuthToken: string = `${process.env["SYSTEM_ACCESSTOKEN"]}`;
        var teamProjectUrl: string = `${process.env["SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"]}${process.env["SYSTEM_TEAMPROJECT"]}`;
        var outputFolder: string = `${process.env["BUILD_ARTIFACTSTAGINGDIRECTORY"]}/PerformanceAnalyzer`;

        var testRunName: string = tl.getInput("testRunName", true);
        var numberOfItemsToFetch: number = Number.parseInt(tl.getInput("numberOfItemsToFetch", true), 10);
        var failIfThresholdExceeded: boolean = tl.getBoolInput("failIfThresholdExceeded", true);
        var threshold: number = Number.parseFloat(tl.getInput("threshold", true));

        var authetnicationMethod: string = "OAuth Token";

        await createCsv.createCsvFiles(
            authetnicationMethod,
            "",
            oAuthToken,
            teamProjectUrl,
            testRunName,
            outputFolder,
            numberOfItemsToFetch,
            failIfThresholdExceeded,
            threshold);
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();