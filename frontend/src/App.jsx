import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [message, setMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }, [message])

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (error) {
      setMessage({ content: 'Wrong credentials', type: 'error' })
    }
  }

  const handleLogout = async (event) => {
    event.preventDefault()

    setUser(null)
    window.localStorage.removeItem('loggedBlogappUser')
  }

  const createBlog = async (blogObject) => {
    try {
      const blog = await blogService.create(blogObject)

      setBlogs(blogs.concat(blog))
      setMessage({
        content: `a new blog ${blog.title} by ${blog.author} added`,
        type: 'success'
      })

      blogFormRef.current.toggleVisibility()
    } catch (error) {
      setMessage({ content: error.message, type: 'error' })
    }
  }

  const likeBlog = async (blog) => {
    try {
      const updatedBlog = await blogService
        .update(blog.id, { likes: blog.likes + 1 })

      const updatedBlogs = blogs.map(b => (b.id === updatedBlog.id ? updatedBlog : b))
      setBlogs(updatedBlogs)
    } catch ({ response }) {
      setMessage({ content: response.data.error, type: 'error' })
    }
  }

  const deleteBlog = async (blog) => {
    try {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
    } catch ({ response }) {
      setMessage({ content: response.data.error, type: 'error' })
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          data-testid="username"
          type="text"
          name="Username"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          data-testid="password"
          type="password"
          name="Password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const blogsForm = () => (
    <Togglable buttonLabel="create new blog" ref={blogFormRef}>
      <BlogForm createBlog={createBlog} />
    </Togglable>
  )

  const blogsResult = (blogs) => (
    <div data-testid="blogs-list">
      {
        blogs.map(blog =>
          <Blog
            key={blog.id}
            blog={blog}
            user={user}
            likeBlog={likeBlog}
            deleteBlog={deleteBlog}
          />
        )
      }
    </div>
  )

  return (
    <div>
      <h2>blogs</h2>
      {
        message &&
        <Notification
          message={message.content}
          type={message.type} />
      }
      {
        user === null
          ? loginForm()
          :
          <>
            <p>
              {user.name} logged in
              <button onClick={handleLogout}>logout</button>
            </p>
            {blogsForm()}
            {blogsResult(blogs)}
          </>
      }
    </div>
  )
}

export default App