const { beforeEach, after, test } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const User = require('../models/user')
const app = require('../app')
const mongoose = require('mongoose')
const { usersInDb } = require('./test_helper')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
})

test('success creating user with valid data sent', async () => {
  const usersAtStart = await usersInDb()

  const data = {
    username: 'ddd',
    name: 'The example user',
    password: 'pwd'
  }

  await api
    .post('/api/users')
    .send(data)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await usersInDb()
  assert(usersAtEnd.length, usersAtStart.length + 1)

  const usernames = usersAtEnd.map(u => u.username)
  assert(usernames.includes(data.username))
})

test('fails creating user with no data sent', async () => {
  const usersAtStart = await usersInDb()

  const data = {}

  await api
    .post('/api/users')
    .send(data)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await usersInDb()
  assert(usersAtEnd.length, usersAtStart.length)
})

test('fails creating user if username length is < 3', async () => {
  const usersAtStart = await usersInDb()

  const data = {
    username: 'dd',
    name: 'Their name',
    password: 'Their Password'
  }

  await api
    .post('/api/users')
    .send(data)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await usersInDb()
  assert(usersAtEnd.length, usersAtStart.length)
})

test('fails creating user if password length is < 3', async () => {
  const usersAtStart = await usersInDb()

  const data = {
    username: 'ddd',
    name: 'Their name',
    password: 'pw'
  }

  await api
    .post('/api/users')
    .send(data)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await usersInDb()
  assert(usersAtEnd.length, usersAtStart.length)
})

after(async () => {
  await mongoose.connection.close()
})