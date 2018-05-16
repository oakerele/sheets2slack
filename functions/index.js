const functions = require('firebase-functions');
const sheets = require('google-spreadsheet');
const async = require('async');
const request = require('request-promise');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// The creds are generated under the service accounts of a Google Cloud Project
// After enabling the Google Drive API under APIs and Services
// More info at:  https://support.google.com/googleapi/answer/6158841?hl=en&ref_topic=7013279
// Service Account Info at: https://github.com/theoephraim/node-google-spreadsheet#service-account-recommended-method
// const credentials = require('./config/service_account.json');
const credentials = {
    client_email: functions.config().googleapi.client_email,
    private_key: functions.config().googleapi.private_key.replace(/\\n/g, '\n')
};

/**
 * NOTE: This is not good code. The code has to accomodate for the limitations of the
 * google API and also bad human habit of leaving empty rows in sheet instead of a border 😫
 */
exports.sheetsToSlack = functions.https.onRequest((request, response) => {
    if (request.method !== "POST") {
        console.error(`Got unsupported ${request.method} request. Expected POST.`);
        return response.send(405, "Only POST requests are accepted");
    }

    // Handle the commands later, Slack expect this request to return within 3000ms
    return admin.database().ref("triggers").push(request.body).then(() => {
        return response.contentType("json").status(200).send({
            "response_type": "ephemeral",
            "text": "Getting response..."
        });
    });
});

exports.commandQueue = functions.database.ref("triggers/{triggerID}").onCreate((snap, context) => {
    const val = snap.val();
    const stockNo = val.text.toLowerCase();
    var worksheet;
    var row, hasStockNumber = false;

    // Replace the id in here with the ID from the Google Sheets URL
    var googleSheets = new sheets('1mpHZ9cSgjgbeFsvEUU3oHp3kbtn4c2v3Z282pnbs6GE');
    var webhookURL = val.response_url;

    // This is a good tool to run each function only after the predecessor is done
    async.series([
        function deleteTrigger(step) {
            admin.database().ref(`triggers/${context.eventId}`).remove();
            step();
        },
        function setAuth(step) {
            // Authenticate the user with creds and pass the callback function
            googleSheets.useServiceAccountAuth(credentials, step);
        },
        function getWorksheet(step) {
            googleSheets.getInfo(function (err, info) {
                // Set the worksheet to the first worksheet, 0 indexed
                worksheet = info.worksheets[0];
                step();
            });
        },
        function workingWithCells(step) {
            // Get the stock number column by setting the min and max to it's 1 based index
            // Scan all the rows since space is a requirement in the google sheet and we can never
            // be too sure we are at the end of the document
            worksheet.getCells({
                'min-row': 1,
                'max-row': parseInt(worksheet.rowCount / 2),
                'min-col': 4,
                'max-col': 4,
                'return-empty': true
            }, function (err, cells) {
                for (var index in cells) {
                    // If the value of each cell is the sane as the stockNo, ding ding we found a winner
                    var value = cells[index].value.toLowerCase();
                    if (value == stockNo) {
                        hasStockNumber = true;
                        row = cells[index].row;
                        break;
                    }
                }
                step();
            });
        },
        function output(step) {
            // Respond with an output.
            var responseText = hasStockNumber ? `The vehicle stock exists on row ${row}` : "Stock does not exist.";
            return promiseReq(webhookURL, responseText).then(() => {
                step();
            });
        }
    ], function (err) {
        return promiseReq(webhookURL, "Something went wrong, make sure you entered the right stock No.");
    });
});

function promiseReq(webhookURL, text) {
    return request({
        uri: webhookURL,
        method: 'POST',
        json: true,
        body: {
            text: responseText
        }
    }).then(() => {
        console.log("The post");
    })
}