import axios from 'axios'

export const http = axios.create({
  baseURL: '/',
  timeout: 5000,
})

http.interceptors.request.use((config) => {
  // 可在此统一添加鉴权信息
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    // 统一错误处理
    return Promise.reject(error)
  },
)