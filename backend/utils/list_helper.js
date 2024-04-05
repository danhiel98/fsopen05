const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const mapper = blog => {
    const result = {
      title: blog.title,
      author: blog.author,
      likes: blog.likes
    }

    return result
  }


  const reducer = (max, blog) => {
    return blog.likes > max.likes ? blog : max
  }

  const mapped = blogs.map(mapper)

  return mapped.reduce(reducer, mapped[0])
}

const mostBlogs = (blogs) => {
  const grouped = _.groupBy(blogs, 'author')
  const ordered = _.orderBy(grouped, 'length', 'desc')
  const blogsAuthor = ordered[0]
  const first = _.first(blogsAuthor)

  return {
    author: first.author,
    blogs: blogsAuthor.length
  }
}

// Prototipo que no me termina de convencer
// ¿A caso .each es asíncrona? JODER
// const mostLikes = (blogs) => {
//   const data = []
//   _.each(blogs, (blog) => {
//     const { author, likes } = blog

//     if (data[author]) {
//       data[author].likes += likes
//     } else {
//       data[author] = { author, likes }
//     }
//   })

//   _.orderBy(data, 'likes')

//   return 0
// }

const mostLikes = (blogs) => {
  const grouped = _.groupBy(blogs, 'author')
  const mapped = _.map(grouped, (value, key) => {
    return {
      author: key,
      likes: totalLikes(value)
    }
  })
  const ordered = _.orderBy(mapped, 'likes', 'desc')


  return _.first(ordered)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}