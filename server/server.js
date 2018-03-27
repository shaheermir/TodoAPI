require('./config/config')

const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')
const _ = require('lodash')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/Todo')
const { User } = require('./models/User')
const { authenticate } = require('./middleware/authenticate')

const port = process.env.PORT || 3000
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
    return res.status(404).send()
  }

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send()
      }
      res.json({ todo })
    })
    .catch(err => res.status(400).send(err))
})

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send()
      }
      res.json({ todo })
    })
    .catch(err => res.status(400).send(err))
})

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id
  const body = _.pick(req.body, ['text', 'completed'])

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      if (!todo) {
        return res.status(404).send()
      }

      res.send({ todo })
    })
    .catch(err => res.status(400).send(err))
})

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  const user = new User(body)

  user
    .save()
    .then(() => user.generateAuthToken())
    .then(token => res.header('x-auth', token).send(user))
    .catch(e => res.status(400).send(e))
})

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

app.listen(port, () => console.log(`Started on port ${port}.`))

module.exports = { app }
