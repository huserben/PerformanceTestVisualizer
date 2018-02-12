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
const createCsv = require("./createcsv");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.argv.length < 7) {
            throw new Error("Missing required parameters");
        }
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
        createCsv.createCsvFiles(authenticationMethod, username, password, server, testRunName, "performanceValues", numberOfItemsToFetch, false, 0.5);
    });
}
run();
//# sourceMappingURL=runFromTerminal.js.map