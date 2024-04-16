const BLOGS_LIST = [
  {
    title: 'First blog',
    author: 'James King',
    url: 'http://thefirst.com',
    likes: 25
  },
  {
    title: 'Almost top',
    author: 'Drake Henderson',
    url: 'http://atop.com',
    likes: 50
  },
  {
    title: 'Miracle blog',
    author: 'Jennie Torre',
    url: 'http://miracle.com',
    likes: 12
  },
  {
    title: 'Debugging',
    author: 'Uriel Smith',
    url: 'http://debugging.com',
    likes: 60
  }
]

const loginWith = async (page, username, password) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByTestId('title').fill(title)
  await page.getByTestId('author').fill(author)
  await page.getByTestId('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()

  const locator = await page.getByTestId('blogs-list')
  await locator.getByText(title).waitFor()
}

export { loginWith, createBlog, BLOGS_LIST }
