const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body

  const authUser = request.user

  if (!authUser.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(authUser.id)

  if (!title || !author) {
    return response
      .status(400)
      .json({ error: 'title or author missing' })
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user.id
  })

  const createdBlog = await blog.save()
  user.blogs = user.blogs.concat(createdBlog._id)
  await user.save()

  response.status(201).json(createdBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const authUser = request.user

  if (!authUser.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(authUser.id)
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'user unauthorized' })
  }

  user.blogs = user.blogs.filter(b => b.toString() !== blog.id)

  await blog.deleteOne()
  await user.save()
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body;

  const updatedBlog = await Blog
    .findByIdAndUpdate(
      request.params.id,
      { title, author, url, likes },
      { new: true, runValidators: true, context: 'query' }
    )

  response.json(updatedBlog)
})

module.exports = blogsRouter