const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const { blogsInDb, initialBlogs } = require('./test_helper')

const api = supertest(app)

const getToken = async () => {
  const requestToken = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const token = requestToken.body.token

  return token
}

beforeEach(async () => {
  await Blog.deleteMany({})

  for (blog of initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('return the correct amount of blogs in the db', async () => {
  const blogs = await blogsInDb()

  assert.strictEqual(blogs.length, initialBlogs.length)
})

test('verify identifier', async () => {
  const blogs = await blogsInDb()

  assert(blogs.every(el => el.id))
})

test('add a new blog fails without an authentication token', async () => {
  const blogsBefore = await blogsInDb()

  const newBlog = {
    title: 'FSOpen Daily',
    author: 'Cristopher Jhones',
    url: 'https://fsopendaily.com',
    likes: 925
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const blogsAfter = await blogsInDb()
  assert.strictEqual(blogsAfter.length, blogsBefore.length)
})

test('add a new blog success with all data sent', async () => {
  const blogsBefore = await blogsInDb()

  const token = await getToken()

  const newBlog = {
    title: 'FSOpen Daily',
    author: 'Cristopher Jhones',
    url: 'https://fsopendaily.com',
    likes: 925
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAfter = await blogsInDb()
  assert.strictEqual(blogsAfter.length, blogsBefore.length + 1)

  const titles = blogsAfter.map(blog => blog.title)
  assert(titles.includes('FSOpen Daily'))
})

test('missing likes property sets default to 0', async () => {
  await Blog.deleteMany()

  const token = await getToken()

  const newBlog = {
    title: 'NoLikes',
    author: 'Daniel Garcia',
    url: 'https://nolikesblog.com',
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAfter = await blogsInDb()
  assert.strictEqual(blogsAfter[0].likes, 0)
})

test('blog without title is not added', async () => {
  const token = await getToken()

  const newBlog = {
    author: 'Daniel Garcia',
    url: 'https://nolikesblog.com',
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAfter = await blogsInDb()

  assert.strictEqual(blogsAfter.length, initialBlogs.length)
})

test('blog without author is not added', async () => {
  const token = await getToken()

  const newBlog = {
    title: 'Title of example',
    url: 'https://nolikesblog.com',
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAfter = await blogsInDb()

  assert.strictEqual(blogsAfter.length, initialBlogs.length)
})

test('update blog when all is sent', async () => {
  const blogs = await blogsInDb()
  const blogToUpdate = blogs[0]

  const token = await getToken()

  const newData = {
    title: 'Title updated',
    author: 'Author updated',
    url: 'https://newurl.com',
    likes: 25
  }

  const updatedBlogResponse = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(newData)
    .expect(200)

  const updatedBlog = updatedBlogResponse.body

  assert.strictEqual(updatedBlog.title, newData.title)
  assert.strictEqual(updatedBlog.author, newData.author)
  assert.strictEqual(updatedBlog.url, newData.url)
  assert.strictEqual(updatedBlog.likes, newData.likes)
})

test('update blog when only title is sent', async () => {
  const blogs = await blogsInDb()
  const blogToUpdate = blogs[0]
  const token = await getToken()

  const newData = {
    title: 'Title updated',
  }

  const updatedBlogResponse = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(newData)
    .expect(200)

  const updatedBlog = updatedBlogResponse.body

  assert.strictEqual(updatedBlog.title, newData.title)
})

test('update blog when nothing is sent', async () => {
  const blogs = await blogsInDb()
  const blogToUpdate = blogs[0]
  const token = await getToken()

  const newData = {

  }

  const updatedBlogResponse = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(newData)
    .expect(200)

  const updatedBlog = updatedBlogResponse.body

  assert.strictEqual(updatedBlog.title, blogToUpdate.title)
  assert.strictEqual(updatedBlog.author, blogToUpdate.author)
  assert.strictEqual(updatedBlog.url, blogToUpdate.url)
  assert.strictEqual(updatedBlog.likes, blogToUpdate.likes)
})

test('update blog when different data is sent', async () => {
  const blogs = await blogsInDb()
  const blogToUpdate = blogs[0]
  const token = await getToken()

  const newData = {
    age: 52,
    phoneNumber: '+1 203-4095-394'
  }

  const updatedBlogResponse = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(newData)
    .expect(200)

  const updatedBlog = updatedBlogResponse.body

  assert(!updatedBlog.age)
  assert(!updatedBlog.phoneNumber)
})

after(async () => {
  await mongoose.connection.close()
})