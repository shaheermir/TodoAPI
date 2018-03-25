const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server')
const { Todo } = require('../models/Todo')

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo'
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
  }
]

beforeEach(done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos)
    })
    .then(() => done())
})

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
