const { MongoClient, ObjectID } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB.')
  }
  console.log('Connected to MongoDB server.')

  // db
  //   .collection('Todos')
  //   .find({
  //     _id: new ObjectID('5ab1b445d0eaad0a08cf693b')
  //   })
  //   .toArray()
  //   .then(
  //     docs => {
  //       console.log('Todos')
  //       console.log(JSON.stringify(docs, null, 2))
  //     },
  //     err => {
  //       console.log('Unable to fetch todos', err)
  //     }
  //   )

  // db
  //   .collection('Todos')
  //   .find()
  //   .count()
  //   .then(
  //     count => {
  //       console.log(`Todos count: ${count}`)
  //     },
  //     err => {
  //       console.log('Unable to fetch count', err)
  //     }
  //   )

  db
    .collection('Users')
    .find({ name: 'Shaheer' })
    .toArray()
    .then(docs => {
      console.log('Users')
      console.log(JSON.stringify(docs, null, 2))
    })

  //db.close()
})
