// import request from 'superagent'
//
// export function post({ username, password, body, url }) {
//   return new Promise((resolve, reject) => {
//     request.post(url)
//     .type('json')
//     .accept('json')
//     .set('Authentication', "Some Kinda Token")
//     // .auth(username, password)
//     .send(JSON.stringify(body))
//     .end((error, res) => {
//       if (!!error || !res.ok) {
//         reject( error )
//       }
//
//       resolve( res )
//     })
//
//   })
// }

import request from 'superagent'

export function post({ url, body }) {
  return new Promise((resolve, reject) => {
    request.post(url)
    .set('Authentication', 'e05c8b437e1243aa9079986bf702d602')
    .set('Content-Type', 'application/xml')
    .send(body)
    .end((error, res) => {
      if (!!error || !res.ok) {
        reject( error )
      }

      resolve( res )
    })

  })
}
