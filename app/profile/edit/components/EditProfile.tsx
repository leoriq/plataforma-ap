'use client'

import type { User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useCallback, useState } from 'react'
import api from '~/utils/api'

interface UserForm extends Omit<User, 'createdAt' | 'updatedAt'> {
  newPassword?: string
  newPasswordConfirmation?: string
}

interface Props {
  user: UserForm
}

export default function EditProfileForm({ user }: Props) {
  const [formData, setFormData] = useState(user)
  const [newImage, setNewImage] = useState<File | undefined>()

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }, [])

  const router = useRouter()

  const handleSubmit = useCallback(async () => {
    if (formData.newPassword !== formData.newPasswordConfirmation) {
      alert('Senhas não conferem')
      return
    }

    let profilePictureId: string | undefined

    if (newImage) {
      const imageFormData = new FormData()
      imageFormData.append('file', newImage)
      imageFormData.append('title', 'profileImage')
      profilePictureId = (
        (await api.post('/api/upload', imageFormData)).data as {
          file: { id: string }
        }
      ).file.id
    }

    await api.patch('/api/user', { ...formData, profilePictureId })
    router.push('/profile')
  }, [formData, router, newImage])

  return (
    <form>
      <label>
        Imagem:
        <input
          type="file"
          name="image"
          onChange={(e) => setNewImage(e.target.files?.[0])}
        />
      </label>
      <label>
        Nome Completo (como no documento):
        <input
          type="text"
          name="fullName"
          value={formData.fullName || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Email:
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </label>
      <label>
        Senha atual:
        <input
          type="password"
          name="password"
          value={formData.password || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Nova senha:
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Confirmação de senha:
        <input
          type="password"
          name="newPasswordConfirmation"
          value={formData.newPasswordConfirmation || ''}
          onChange={handleChange}
        />
      </label>
      <button
        type="submit"
        onClick={(e) => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        Salvar
      </button>
    </form>
  )
}
