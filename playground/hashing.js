const { SHA256 } = require('crypto-js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const password = '123abc!'

// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash)
//   })
// })

// const hashedPassword = '$2a$10$vxJjhsgsNNSP30Wwd0StHeg3/GPKchwe3JxlZ0PwJWwGE4nDx7p8G'

// bcrypt.compare(password, hashedPassword, (err, result) => {
//   console.log(result)
// })

// const data = {
//   id: 10
// }

// const token = jwt.sign(data, '123')

// const decoded = jwt.verify(token, '1233')

// console.log(decoded)

// const message = 'My name is Shaheer Mir.'
// const hash = SHA256(message).toString()

// console.log(`Message: ${message}`)
// console.log(`Hash: ${hash}`)

// const data = {
//   id: 4
// }

// const token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// const resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString()

// if (resultHash === token.hash) {
//   console.log('Data was not changed.')
// } else {
//   console.log('Data was changed. Do not trust!')
// }
