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
const tl = require("vsts-task-lib/task");
const createCsv = require("./createcsv");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var oAuthToken = `${process.env["SYSTEM_ACCESSTOKEN"]}`;
            var teamProjectUrl = `${process.env["SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"]}${process.env["SYSTEM_TEAMPROJECT"]}`;
            var outputFolder = `${process.env["BUILD_ARTIFACTSTAGINGDIRECTORY"]}/PerformanceAnalyzer`;
            var testRunName = tl.getInput("testRunName", true);
            var numberOfItemsToFetch = Number.parseInt(tl.getInput("numberOfItemsToFetch", true), 10);
            var failIfThresholdExceeded = tl.getBoolInput("failIfThresholdExceeded", true);
            var threshold = Number.parseFloat(tl.getInput("threshold", true));
            var authetnicationMethod = "OAuth Token";
            yield createCsv.createCsvFiles(authetnicationMethod, "", oAuthToken, teamProjectUrl, testRunName, outputFolder, numberOfItemsToFetch, failIfThresholdExceeded, threshold);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
//# sourceMappingURL=index.js.map