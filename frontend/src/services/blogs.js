import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const create = async newObject => {
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = async (id, newData) => {
  const url = `${baseUrl}/${id}`

  const response = await axios.put(url, newData)

  return response.data
}

const remove = async (id) => {
  const url = `${baseUrl}/${id}`
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.delete(url, config)

  return response.data
}

export default {
  getAll,
  create,
  update,
  remove,
  setToken
}