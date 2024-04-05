const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'The new world',
    author: 'Richard Smith',
    url: 'https://thenewworldblog.com',
    likes: 500
  },
  {
    title: 'Smashing the code',
    author: 'Robert Stones',
    url: 'https://smashthecode.io',
    likes: 855
  },
  {
    title: 'SpiderTech',
    author: 'Alisson Lopez',
    url: 'https://thespidertech.com',
    likes: 1200
  },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb
}