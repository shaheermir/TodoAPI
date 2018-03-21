const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/Todo')
const { User } = require('./models/User')

const app = express()
app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  })

  todo
    .save()
    .then(doc => res.json(doc))
    .catch(e => res.status(400).send(e))
})

app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => res.json({ todos }))
    .catch(err => res.status(400).send(err))
})

app.get('/todos/:id', (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    res.status(404).send()
  }

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        res.status(404).send()
      }
      res.json({ todo })
    })
    .catch(err => res.status(400).send())
})
app.listen(3000, () => console.log('Started on port 3000.'))

module.exports = { app }
