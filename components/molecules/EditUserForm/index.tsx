'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'

import { Role } from '@prisma/client'

import styles from './EditUserForm.module.scss'
import Select from 'react-select'
import FormInput from '~/components/atoms/FormInput'
import api from '~/utils/api'
import { useModal } from '~/contexts/ModalContext'
import Button from '~/components/atoms/Button'

interface Props {
  user: {
    id: string
    fullName: string | null
    email: string
    profilePictureFileId: string | null
    createdAt: Date
    roles: Role[]
  }
}

export default function EditUserForm({ user }: Props) {
  const { displayModal, hideModal } = useModal()
  const [roles, setRoles] = useState<Role[]>(user.roles)
  const allRoles = useMemo(() => Object.values(Role), [])

  const roleOptions = useMemo(
    () =>
      allRoles.map((role) => ({
        label: role,
        value: role,
      })),
    [allRoles]
  )
  const roleValues = useMemo(
    () =>
      roles.map((role) => ({
        label: role,
        value: role,
      })),
    [roles]
  )

  const imageUrl = useMemo(() => {
    if (user.profilePictureFileId) {
      return `/api/upload?id=${user.profilePictureFileId}`
    }

    return '/avatar-black.png'
  }, [user.profilePictureFileId])

  const handleSubmit = useCallback(async () => {
    try {
      await api.patch(`/api/user/change-roles`, {
        id: user.id,
        roles,
      })
    } catch (error) {
      console.error(error)
      displayModal({
        title: 'Error',
        body: 'Something went wrong. Please try again later.',
        buttons: [
          {
            text: 'OK',
            onClick: hideModal,
          },
        ],
      })
    }
  }, [roles, user.id, displayModal, hideModal])
  return (
    <form className={styles.form}>
      <div className={styles.imageContainer}>
        <Image src={imageUrl} alt="Profile Picture" fill sizes="10rem" />
      </div>
      <FormInput
        label="Full Name"
        name="fullName"
        value={user.fullName ?? 'No data.'}
        disabled
      />
      <FormInput
        label="Email"
        name="email"
        value={user.email}
        disabled
        type="email"
      />
      <p>
        Created At:{' '}
        {Intl.DateTimeFormat('en-US', {
          dateStyle: 'long',
          timeStyle: 'medium',
        }).format(user.createdAt)}
      </p>
      <Select
        className={styles.multiSelect}
        isMulti
        onChange={(selected) => setRoles(selected.map((s) => s.value))}
        value={roleValues}
        options={roleOptions}
      />
      <Button
        onClick={async (e) => {
          e.preventDefault()
          await handleSubmit()
        }}
        color="success"
      >
        Save
      </Button>
    </form>
  )
}
