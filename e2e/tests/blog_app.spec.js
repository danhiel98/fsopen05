const { test, expect } = require('@playwright/test')
const { loginWith, createBlog, BLOGS_LIST } = require('./helper')
const { describe, beforeEach } = test

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await request.post('/api/users', {
      data: {
        name: 'Tester User',
        username: 'tester',
        password: 'thetester'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('Blogs')

    await expect(locator).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')

      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('Wrong credentials')
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    test('a new blog can be created', async ({ page }) => {
      const blog = {
        title: 'Blog created by playwright',
        author: 'Playwright',
        url: 'http://playwright.com'
      }
      await createBlog(page, blog)

      const locator = await page.getByTestId('blogs-list')

      await expect(locator.getByText(blog.title)).toBeVisible()
    })

    describe('when there are blogs', () => {
      const blogData = {
        title: 'Playwright 2',
        author: 'Author',
        url: 'http://blog.com'
      }

      beforeEach(async ({ page }) => {
        await createBlog(page, blogData)
      })

      test('a blog can be edited (like)', async ({ page }) => {
        await page.getByRole('button', { name: 'show' }).first().click()

        const likesSpan = await page.locator('.likesCount').first()
        const likeButton = await page.getByRole('button', { name: 'like' }).first()
        await likeButton.click()

        await expect(likesSpan).toHaveText('likes 1')
        await page.pause()
      })

      test('a blog can be deleted', async ({ page }) => {
        await page.getByRole('button', { name: 'show' }).click()
        page.on('dialog', async dialog => {
          console.log(`Dialog message: ${dialog.message()}`)
          await dialog.accept()
        })
        await page.getByRole('button', { name: 'remove' }).click()

        const locator = await page.getByTestId('blogs-list')
        await expect(locator.getByText(blogData.title)).not.toBeVisible()
      })

      test('only allowed user can see the delete button', async ({ page }) => {
        const blogsLocator = await page.getByTestId('blogs-list')
        await blogsLocator.getByRole('button', { name: 'show' }).click()

        await expect(blogsLocator.getByRole('button', { name: 'remove' })).toBeVisible()

        await page.getByRole('button', { name: 'logout' }).click()
        await loginWith(page, 'tester', 'thetester')
        await blogsLocator.getByRole('button', { name: 'show' }).click()

        await expect(blogsLocator.getByRole('button', { name: 'remove' })).not.toBeVisible()
      })

      // test('blogs arranged in the order according to likes', async ({ page }) => {

      // })
    })
  })
})