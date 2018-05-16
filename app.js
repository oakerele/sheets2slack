const sheets = require('google-spreadsheet');
const express = require('express');
const config = require('./config/service_account.json');
const app = express();

// The creds are generated under the service accounts of a Google Cloud Project
// After enabling the Google Drive API under APIs and Services
// More info at:  https://support.google.com/googleapi/answer/6158841?hl=en&ref_topic=7013279
// Service Account Info at: https://github.com/theoephraim/node-google-spreadsheet#service-account-recommended-method
// const credentials = require('./config/service_account.json');

// const credentials = {
//     client_email: process.env.CLIENT_EMAIL,
//     private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
// };

const credentials = {
    client_email: config.client_email,
    private_key: config.private_key.replace(/\\n/g, '\n')
};

app.post('/getStockNumber', (request, response) => {
    console.log(request);
    const val = request.body;
    const stockNo = val.text.toLowerCase();
    var worksheet;
    var row, hasStockNumber = false;

    // Replace the id in here with the ID from the Google Sheets URL
    var googleSheets = new sheets('1mpHZ9cSgjgbeFsvEUU3oHp3kbtn4c2v3Z282pnbs6GE');

    // Authenticate the user with creds and pass the callback function
    googleSheets.useServiceAccountAuth(credentials, () => {
        googleSheets.getInfo(function (err, info) {
            if (err) {
                console.error("Get Info: ", err);
                return response.contentType("json").status(200).send({
                    "response_type": "ephemeral",
                    "text": "Something went wrong, make sure you entered the right stock No."
                });
            }
            // Set the worksheet to the first worksheet, 0 indexed
            worksheet = info.worksheets[0];
            worksheet.getCells({
                'min-row': 1,
                'max-row': parseInt(worksheet.rowCount / 2),
                'min-col': 4,
                'max-col': 4,
                'return-empty': true
            }, function (err, cells) {
                if (err) {
                    console.error("Get Cells: ", err);
                    return pushResponse(webhookURL, "Something went wrong, make sure you entered the right stock No.");
                }
                for (var index in cells) {
                    // If the value of each cell is the sane as the stockNo, ding ding we found a winner
                    var value = cells[index].value.toLowerCase();
                    if (value == stockNo) {
                        hasStockNumber = true;
                        row = cells[index].row;
                        break;
                    }
                }

                var responseText = hasStockNumber ? `The vehicle stock exists on row ${row}` : "Stock does not exist.";
                return response.contentType("json").status(200).send({
                    "response_type": "ephemeral",
                    "text": responseText
                });
            });
        });
    });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});