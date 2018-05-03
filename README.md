# Sheets2Slack
Query a google sheet to see if a field exists or not, using firebase cloud functions as the serverless endpoint

## Getting Started
Run `npm install` in the functions directory, then `firebase init` > Functions

Set the firebase functions config fields using `firebase functions:config:set googleapi.client_email` and `firebase functions:config:set googleapi.private_key`

Deploy the Firebase Cloud Functions after intialization using `firebase deploy`.

