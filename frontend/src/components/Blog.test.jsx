import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('managing blog actions', () => {
  let container
  let blog
  beforeEach(() => {
    blog = {
      title: 'The blog for testing',
      author: 'Daniel Garcia',
      url: 'https://theblogurl.com',
      likes: 25,
      user: {
        username: 'root',
        name: 'Superuser'
      }
    }

    container = render(<Blog blog={blog} />).container
  })

  test('component renders title and author only', async () => {
    const ul = container.querySelector('ul')
    expect(ul).toBeNull()
  })

  test('url and number of likes are shown when clicking button', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show')
    await user.click(button)

    const ul = container.querySelector('ul')
    expect(ul).not.toBeNull()
    screen.getByText(blog.url)
    screen.getByText(blog.user.name)
    screen.getByText(`likes ${blog.likes}`)
  })

})

test('like button clicked twice', async () => {
  const likeBlog = vi.fn(async () => {
    blog.likes += 1

    return { success: true }
  })

  const user = userEvent.setup()

  const blog = {
    title: 'The blog for testing',
    author: 'Daniel Garcia',
    url: 'https://theblogurl.com',
    likes: 25,
    user: {
      username: 'root',
      name: 'Superuser'
    }
  }

  render(<Blog blog={blog} likeBlog={likeBlog} />)

  const button = screen.getByText('show')
  await user.click(button)

  const likeButton = screen.getByText('like')

  await user.click(likeButton)
  await user.click(likeButton)

  expect(likeBlog.mock.calls).toHaveLength(2)
})