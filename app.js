const sheets = require('google-spreadsheet');
const express = require('express');
const bodyParser = require('body-parser');
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
    client_email: process.env.CLIENT_EMAIL,
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCuUlzv7OySkUxX\nRQBQ6y2NE25+1SFH39IGi3zuG6JR2+r9Ws5k3Lr6ml37+f6IbRlbpWmd2XWIpiLo\nDMXeGvuIKDVxiN/qwGcp5EMnHZVKjfqiYB5vAjBNoBFlysmNvSJmLc79rhFSUDte\nbv4HSbDh5V5k9XdC2bnuio1T5BozGYRCgSd4p60YumKpPKOrduA1HXbKs9wMjogY\nXYxn9UHoAidGuL1uDxECK3XVicE3XgOBgUNGuGnUrec8AM5K0GwnhEjkamP49NUF\n1NNuPncRBKiQ23fKw9wKUKMhBWVhkVjb68D5Tlry9lsJyA9CNTMTEbCz9tFyK0H5\ntdnfFHh7AgMBAAECggEAVWyIHYzRW3u3WNa38m9k6Yq5rY6c2f9dCRcG2BoTn6Cw\n1YnPtY6TVCYcY1PdPxaThB0ZliBP3/BmD6feuNopI85sbiAgdoXlqBozLDJri9bq\nmPKYR1bfu9JyZBsNTRd/iWnuUtMfquIlTb//XSvn8bL4YGoHkOtoGXStEAyqKBqL\n/yIl7v6J1OfNZYafHR+EF6Z02apj0VReKv/z60LivLekLipUAsoV8/P8AgDOYm8w\nFMZ4pUPOqo+rsIqbmHPbhxNmCPnaimzN5lZF7jffLQpk96vlicXW8ha2fyB5T4J+\n6uknQYE7E19gQQdxkPZigv+8n8l0ff9ddZ4FDWHijQKBgQDhoP0fIreiC0sMwnoP\n2t8la5l5UPj8ZarU71TwQIob/uSj7/Qrus+SySBaYaEh4bUgkDjbRXuamsWS5s7y\npwx7EZQ5sdZAYyGkibItEExtmLClBLU3+xxftjAZPni9o+vc7Bhp1vbrA+FKx9oc\nGgwIZJ5YjT40Ax6IxZSNgKBiFwKBgQDFyV3jwzco7dkMLk08XlUCPGeOh+3GKH3/\nup6DeS1Qtheos53dChDeDn5T4ptLXiT+kjKW8xKysblwzu3Si0c1Rq6wv1r+PedO\nYkRwEi41aoaC83pAnGRp+8C4Q0nbWcS6Wi9iAGyQeL3mrixYB5AXaG7sXjtuvRvt\nzUsdMShPPQKBgQC37FLKAbPtfQU1poZ3zDQgveCCmzYMERg7scjse7/ZaGObG2xQ\nBV1Vy2v7ISCHjQToQYiHfdFvSwEJaeqCtRegbskEauo63FQ9Wx2KTIHwyQodyoOq\n2aDciJgWy+0Csc//69lO1bO8ChKpsdYjGDx8zwChMKnnHi/S0DTzUEntCwKBgF5B\nmHzyi1b2AnnLlwMt8VUfdDp4jNfidClqxh/hn7bXEG9VKeYs5dztC0butxMzym2H\nPpSxQjfmenlIJA4yUb0R8i5JAxQmbBTuv66o+1x5Z6EAZ0JjRXc8gptNdeUS4q3s\nTKhni1VONTG5z2gkMob1PednAOvFM4ogS6udwZgBAoGAbhhVjvA0Dve9Cy981Tir\nHUZUIKu8u6Xkmj4t/mqMGQKF6aJV2T9MCYUGzxxzeBjnECY2mj0k5yNKcF59QOmF\nARpVAq1LPcn4glvwObV/hGkIYeywzq9F+aAxwrN1AW394lvXYB2W5uEWwtNMLaAO\nwUDAjZ9i2zuI8Vx5LeXutSg=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n')
};

// Allow json and url body type for req.body
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Start the server
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send("AndyMohr Sheets 4 Slack");
})

app.post('/getStockNumber', function (req, res) {
    const val = req.body;
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
                return res.contentType("json").status(200).send({
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
                return res.contentType("json").status(200).send({
                    "response_type": "ephemeral",
                    "text": responseText
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
