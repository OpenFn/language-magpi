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
