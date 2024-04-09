import { useState } from 'react'

const Blog = ({ user, blog, likeBlog, deleteBlog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [visible, setVisible] = useState(false)
  const [likes, setLikes] = useState(blog.likes)

  const action = visible ? 'hide' : 'show'
  const sameUser = user && user.username === blog.user.username

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = async () => {
    setLikes(likes + 1)
    await likeBlog(blog)
  }

  const handleDelete = async () => {
    const result = confirm(`Remove blog ${blog.title} by ${blog.author}?`)

    if (result) {
      await deleteBlog(blog)
    }
  }

  const blogDetail = () => (
    <>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        <li><a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a></li>
        <li><span>likes {likes}</span> <button onClick={handleLike}>like</button></li>
        <li>{blog.user.name}</li>
      </ul>
      {sameUser &&
        <button onClick={handleDelete}>remove</button>
      }
    </>
  )

  return (
    <div style={blogStyle}>
      {blog.title} {blog.author}
      <button onClick={toggleVisibility}>{action}</button>

      {visible && blogDetail()}
    </div>
  )
}

export default Blog