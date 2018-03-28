const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server')
const { Todo } = require('../models/Todo')
const { User } = require('../models/User')
const { todos, users, populateTodos, populateUsers } = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
  it('should create a new Todo', done => {
    const text = 'Eat lunch'

    request(app)
      .post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1)
            expect(todos[0].text).toBe(text)
            done()
          })
          .catch(err => done(err))
      })
  })

  it('should not create todo', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2)
            done()
          })
          .catch(e => done(e))
      })
  })
})

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should return 404 if todo not found', done => {
    const id = new ObjectID().toHexString()
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object IDs', done => {
    request(app)
      .get('/todos/abc123')
      .expect(404)
      .end(done)
  })
})

describe('DELTE /todos/:id', () => {
  it('should remoe a todo', done => {
    const id = todos[0]._id.toHexString()

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(id)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.findById(id)
          .then(todo => {
            expect(todo).toBeFalsy()
            done()
          })
          .catch(e => done(e))
      })
  })

  it('should return 404 if todo not found', done => {
    const id = new ObjectID().toHexString()

    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 if ObjectID is invalid', done => {
    request(app)
      .delete(`/todos/abc123`)
      .expect(404)
      .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    const id = todos[0]._id.toHexString()
    const newText = 'Hello World!'

    request(app)
      .patch(`/todos/${id}`)
      .send({ text: newText, completed: true })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(newText)
        expect(res.body.todo.completed).toBe(true)
        expect(res.body.todo.completedAt).toBeTruthy()
      })
      .end(done)
  })

  it('should clear completedAt when todo is not completed', done => {
    const id = todos[1]._id.toHexString()
    const newText = 'Hello World!!!'

    request(app)
      .patch(`/todos/${id}`)
      .send({ text: newText, completed: false })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(newText)
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).toBeFalsy()
      })
      .end(done)
  })
})

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  })

  it('should return a 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({
          name: 'JsonWebTokenError',
          message: 'jwt must be provided'
        })
      })
      .end(done)
  })
})

describe('POST /users', () => {
  it('should create a user', done => {
    const email = 'example@example.com'
    const password = 'abc123'

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy()
        expect(res.body._id).toBeTruthy()
        expect(res.body.email).toBe(email)
      })
      .end(err => {
        if (err) {
          return done()
        }

        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy()
            expect(user.password).not.toBe(password)
            done()
          })
          .catch(err => done(err))
      })
  })

  it('should return validation errors for invalid requests', done => {
    const email = 'blah-blah-blah'
    const password = 'abc'

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.body.errors).toBeTruthy()
      })
      .end(done)
  })

  it('should not create user if email is in use', done => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'testPassword'
      })
      .expect(400)
      .end(done)
  })
})

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    const { email, password } = users[1]
    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy()
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[0]).toHaveProperty('access', 'auth')
            expect(user.tokens[0]).toHaveProperty('token', res.headers['x-auth'])
            done()
          })
          .catch(err => done(err))
      })
  })

  it('should reject invalid login', done => {
    const { email } = users[1]
    const password = 'lol'

    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy()
      })
      .end((err, res) => {
        if (err) {
          done(err)
        }

        User.findById(users[1])
          .then(user => {
            expect(user.tokens.length).toBe(0)
            done()
          })
          .catch(err => done(err))
      })
  })
})

describe('DELETE /users/me/token', () => {
  it('should remove token on logout', done => {
    const id = users[0]._id
    const token = users[0].tokens[0].token

    request(app)
      .delete('/users/me/token')
      .set('x-auth', token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err)
        }

        User.findById(id)
          .then(user => {
            expect(user.tokens.length).toBe(0)
            done()
          })
          .catch(err => done(err))
      })
  })
})
