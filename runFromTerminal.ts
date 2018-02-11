import createCsv = require("./createcsv");

async function run(): Promise<void> {

    if (process.argv.length < 7) {
        throw new Error("Missing required parameters");
    }

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

    createCsv.createCsvFiles(
        authenticationMethod,
        username,
        password,
        server,
        testRunName,
        "performanceValues",
        numberOfItemsToFetch,
        false,
        12);
}

run();