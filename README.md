Language Magpi
==============

Language Pack for building expressions and operations for working with
the [Magpi inbound API](http://support.magpi.com/support/solutions/articles/4839-magpi-inbound-api) and the
[Magpi outbound API](http://support.magpi.com/support/solutions/articles/4865-magpi-outbound-api).

Documentation
-------------
## Submit new records API
Allows you to push data to Magpi to create a new record for a form which exists in a user account.

#### Using `submitRecord`:
```js
`submitRecord(1,2)`
```

## Fetch data from Magpi
Allows you to fetch data from Magpi and post it elsewhere.

#### Using `fetchData`:
https://www.magpi.com/api/surveydata/v2?username=taylordowns2000&accesstoken=blahblahblah&surveyid=921409679070
```js
`fetchSurveyData(1,2,3)`
```

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
