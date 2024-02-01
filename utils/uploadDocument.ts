import axios from 'axios'
import api from './api'

export async function uploadDocument(file: File, title?: string) {
  const { url, id } = (
    await api.post('/api/upload', {
      name: file.name,
      title,
      type: file.type,
    })
  ).data as { url: string; id: string }
  await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
  })
  return id
}
