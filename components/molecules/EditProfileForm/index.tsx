'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useCallback, useState, useMemo } from 'react'
import Button from '~/components/atoms/Button'
import FormInput from '~/components/atoms/FormInput'
import api from '~/utils/api'

import styles from './EditProfileForm.module.scss'
import { ProfileRequestZod } from '~/schemas/ProfileRequest'
import Dropzone from 'react-dropzone'
import { useModal } from '~/contexts/ModalContext'
import { signOut } from 'next-auth/react'
import { uploadDocument } from '~/utils/uploadDocument'

interface Props {
  user: {
    id: string
    fullName: string
    email: string
    profilePictureFileId: string
  }
}

export default function EditProfileForm({ user }: Props) {
  const router = useRouter()
  const { displayModal, hideModal } = useModal()

  const [formData, setFormData] = useState({
    ...user,
    password: '',
    newPassword: '',
    newPasswordConfirmation: '',
  })
  const [newImage, setNewImage] = useState<File | undefined>()

  const imageUrl = useMemo(() => {
    if (newImage) {
      return URL.createObjectURL(newImage)
    }

    if (user.profilePictureFileId) {
      return `/api/upload?id=${user.profilePictureFileId}`
    }

    return '/avatar-black.png'
  }, [newImage, user.profilePictureFileId])

  const errors = useMemo(() => {
    const result = ProfileRequestZod.safeParse(formData)
    if (result.success) return null

    return result.error.format()
  }, [formData])

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (errors) {
      displayModal({
        title: 'Error',
        body: 'Please fill out all fields correctly',
        buttons: [
          {
            text: 'Ok',
            onClick: () => {
              hideModal()
            },
          },
        ],
      })
      console.error(errors)
      return
    }

    let profilePictureFileId: string | undefined

    if (newImage) {
      profilePictureFileId = await uploadDocument(newImage, 'profileImage')
    }

    await api.patch('/api/user', { ...formData, profilePictureFileId })
    if (formData.newPassword) {
      await signOut()
      router.push('/login')
      return
    }
    router.refresh()
  }, [formData, router, newImage, errors, displayModal, hideModal])

  return (
    <form className={styles.form}>
      <Dropzone
        onDrop={(acceptedFiles) => setNewImage(acceptedFiles[0])}
        accept={{ 'image/*': [] }}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className={styles.imageContainer}>
            <input {...getInputProps()} />
            <div className={styles.overlay}>
              <span>Change Image</span>
            </div>
            <Image src={imageUrl} alt="Profile Picture" fill />
          </div>
        )}
      </Dropzone>
      <FormInput
        label="Full Name:"
        name="fullName"
        value={formData.fullName || ''}
        onChange={handleChange}
        errors={errors?.fullName?._errors}
      />
      <FormInput
        label="Email:"
        name="email"
        type="email"
        value={formData.email || ''}
        onChange={handleChange}
        errors={errors?.email?._errors}
      />
      <FormInput
        label="Current password:"
        name="password"
        type="password"
        value={formData.password || ''}
        onChange={handleChange}
        errors={errors?.password?._errors}
      />
      <FormInput
        label="New password:"
        name="newPassword"
        type="password"
        value={formData.newPassword || ''}
        onChange={handleChange}
        errors={errors?.newPassword?._errors}
      />
      <FormInput
        label="Confirm new password:"
        name="newPasswordConfirmation"
        type="password"
        value={formData.newPasswordConfirmation || ''}
        onChange={handleChange}
        errors={errors?.newPasswordConfirmation?._errors}
      />
      <Button
        color="success"
        onClick={async (e) => {
          e.preventDefault()
          await handleSubmit()
        }}
      >
        Save Changes
      </Button>
    </form>
  )
}
