const functions = require('firebase-functions');
const sheets = require('google-spreadsheet');

// The creds are generated under the service accounts of a Google Cloud Project
// After enabling the Google Drive API under APIs and Services
// More info at:  https://support.google.com/googleapi/answer/6158841?hl=en&ref_topic=7013279
// Service Account Info at: https://github.com/theoephraim/node-google-spreadsheet#service-account-recommended-method
const credentials = require('./config/service_account.json');

// Replace the id in here with the ID from the Google Sheets URL
var googleSheet = new sheets('1bJuthZOtLK_pyt0ClEl3K9lbByRlm_LrlbjqnPYvYQU')

exports.sheetsToSlack = functions.https.onRequest((request, response) => {
    // Authenticate with the Google Spreadsheets API.
    const stockNo = request.body.text;
    
});
// var options = {
//     query: `stocknumber=${stockNo}`
// }
var options = {
    orderby: 'stocknumber',
    query: `stocknumber=T29219`
}
googleSheet.useServiceAccountAuth(credentials, function (err) {
    if (err) {
        console.error(err);
        response.send("Could not authenticate user. See Admin for more details.");
    }
    // Get all of the rows from the spreadsheet.
    googleSheet.getRows(1, options, function (err, rows) {
        if (err) {
            console.error(err);
            response.send("Could not retrieve information. See Admin for more details.");
        }
        console.log(rows);
    });
});