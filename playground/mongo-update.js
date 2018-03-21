const { MongoClient, ObjectID } = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB.')
  }
  console.log('Connected to MongoDB server.')

  // db
  //   .collection('Todos')
  //   .findOneAndUpdate(
  //     {
  //       text: 'Go to gym'
  //     },
  //     {
  //       $set: {
  //         completed: true
  //       }
  //     },
  //     {
  //       returnOriginal: false
  //     }
  //   )
  //   .then(res => console.log(res))

  db
    .collection('Users')
    .findOneAndUpdate(
      {
        _id: new ObjectID('5ab1b65d3510f80a21cda7a0')
      },
      {
        $inc: {
          age: 1
        },
        $set: {
          name: 'Shaheer Mir'
        }
      },
      {
        returnOriginal: false
      }
    )
    .then(res => console.log(res))

  // db.close()
})
