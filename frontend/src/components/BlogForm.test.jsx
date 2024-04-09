/**
 * Make a test for the new blog form.
 * The test should check, that the form calls the event handler
 * it received as props with the right details when a new blog is created.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('Check if the event handler received by blog form is working', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  const _title = screen.getByPlaceholderText('Title')
  const _author = screen.getByPlaceholderText('Author')
  const _url = screen.getByPlaceholderText('URL')
  const submitButton = screen.getByText('create')

  await user.type(_title, 'Testing title')
  await user.type(_author, 'Testing author')
  await user.type(_url, 'http://testingurl.com')
  await user.click(submitButton)

  console.log(createBlog.mock.calls)

  expect(createBlog.mock.calls).toHaveLength(1)
  const { title, author, url } = createBlog.mock.calls[0][0]
  expect(title).toBe('Testing title')
  expect(author).toBe('Testing author')
  expect(url).toBe('http://testingurl.com')
})