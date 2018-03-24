const { mongoose } = require('../server/db/mongoose')
const { Todo } = require('../server/models/Todo')
const { ObjectID } = require('mongodb')

// Todo.remove({}).then(res => {
//   console.log(res)
// })

Todo.findOneAndRemove({
  text: 'test'
}).then(doc => {
  console.log(doc)
})

// Todo.findByIdAndRemove('5ab6cadf3dfd9b28b6b08c1a').then(doc => {
//   console.log(doc)
// })
