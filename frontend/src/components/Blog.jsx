import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ user, blog, deleteBlog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [visible, setVisible] = useState(false)
  const [likes, setLikes] = useState(blog.likes)

  const action = visible ? 'hide' : 'view'
  const sameUser = user.username === blog.user.username

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = async () => {
    const updatedLikes = likes + 1

    setLikes(updatedLikes)

    await blogService
      .update(blog.id, { likes: updatedLikes })
  }

  const handleDelete = async () => {
    const result = confirm(`Remove blog ${blog.title} by ${blog.author}?`)

    if (result) {
      deleteBlog(blog)
    }
  }

  const blogDetail = () => (
    <>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        <li><a href={blog.url} target="_blank" rel="noreferrer">{blog.url}</a></li>
        <li>likes {likes} <button onClick={handleLike}>like</button></li>
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