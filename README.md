Language Magpi
==============

Language Pack for building expressions and operations for working with
the [Magpi inbound API](http://support.magpi.com/support/solutions/articles/4839-magpi-inbound-api) and the
[Magpi outbound API](http://support.magpi.com/support/solutions/articles/4865-magpi-outbound-api).

Documentation
-------------
## Fetch data from Magpi
Allows you to fetch data from Magpi and post it elsewhere.

#### Using `fetchSurveyData`:
https://www.magpi.com/api/surveydata/v2?username=taylordowns2000&accesstoken=blahblahblah&surveyid=921409679070
```js
fetchSurveyData({
  "formId": 37479,
  // "afterDate": "2016-01-01",
  // "beforeDate": "2017-01-01",
  "postUrl": "https://www.openfn.org/inbox/secret-5c25-inbox-ba2c-url"
});
```

<!-- ## Submit new records
Allows you to push data to Magpi to create a new record for a form which exists in a user account.

#### Using `submitRecord`:
```js
`submitRecord(1,2)`
``` -->

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
