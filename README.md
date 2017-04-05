Language Magpi [![Build Status](https://travis-ci.org/OpenFn/language-magpi.svg?branch=master)](https://travis-ci.org/OpenFn/language-magpi)
==============

Language Pack for building expressions and operations for working with
the [Magpi inbound API](http://support.magpi.com/support/solutions/articles/4839-magpi-inbound-api) and the
[Magpi outbound API](http://support.magpi.com/support/solutions/articles/4865-magpi-outbound-api).

The Magpi API is under development and this pack may change.

Documentation
-------------

## Sample configuration
```json
"configuration": {
  "username": "taylordowns2000",
  "accessToken": "super-secret"
}
```

## Fetch data from Magpi
Allows you to fetch data from Magpi and post it elsewhere.

#### Using `fetchSurveyData`:
https://www.magpi.com/api/surveydata/v2?username=taylordowns2000&accesstoken=blahblahblah&surveyid=921409679070
```js
fetchSurveyData({
  "formId": 37479,
  "afterDate": "2016-01-01",
  // "beforeDate": "2017-01-01",
  "postUrl": "https://www.openfn.org/inbox/secret-5c25-inbox-ba2c-url"
});
```

## Submit new records
**wip**
Allows you to push data to Magpi to create a new record for a form which exists in a user account.

#### Using `submitRecord`:
```js
submitRecord(1,2)
```

#### Magpi Outbound API Parameters:
- `username`:	The account username.
- `accesstoken`:	The accesstoken generated on the site. Each accesstoken is associated with the user who generated.
- `surveyid`:	The surveyid is not the survey's name. The surveyid can be obtained from the list of forms generated in 1 above.
- `startdate`:	Start date of the data to be returned. Filtering is done based on the DateStamp and is inclusive.(Optional). The date format should be the same one as the one on the data tab/ The date format should be the same one as the one on the data tab
- `enddate`:	End date of the data to be returned. Filtering is done based on the DateStamp and is inclusive.(Optional)

Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
