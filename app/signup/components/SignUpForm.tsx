'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useCallback, useState } from 'react'
import api from '~/utils/api'

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }, [])

  const router = useRouter()

  const handleSubmit = useCallback(async () => {
    if (formData.password !== formData.passwordConfirmation) {
      alert('Senhas não conferem')
      return
    }
    await api.patch('/api/user/signup', formData)
    await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    })
    router.push('/login')
  }, [formData, router])

  return (
    <form>
      <label>
        Nome Completo (como no documento):
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
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
        Senha:
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </label>
      <label>
        Confirmação de senha:
        <input
          type="password"
          name="passwordConfirmation"
          value={formData.passwordConfirmation}
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
        Cadastrar
      </button>
    </form>
  )
}
