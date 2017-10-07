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
const tfsRestService = require("./tfsrestservice");
const taskConstants = require("./taskconstants");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tfsRestService.initialize(taskConstants.AuthenticationMethodPersonalAccessToken, "whatever", "sww3otrtvfaqi4sqcqqjceq23lxgvlyjfoftqox7272qc3vxyi2q", "https://benjsawesometfstest.visualstudio.com/DefaultCollection/Build Test", false);
            var testRuns = yield tfsRestService.getTestRuns("CI Test", 3);
            for (let testRun of testRuns) {
                console.log(`Getting test results of run...`);
                var testResults = yield tfsRestService.getTestResults(testRun);
                for (let result of testResults) {
                    console.log(`Test: ${result.testCaseTitle}`);
                    console.log(`Result: ${result.outcome}`);
                    console.log(`Ran for: ${result.durationInMs / 1000} seconds`);
                }
                console.log("--------------------------------");
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
run();
