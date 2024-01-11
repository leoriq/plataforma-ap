'use client'

import type { Role } from '@prisma/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '~/utils/api'

import styles from './AddUserForm.module.scss'
import FormInput from '~/components/atoms/FormInput'
import Button from '~/components/atoms/Button'
import {
  UserCreateLinkRoleZod,
  type UserCreateLinkRole,
} from '~/schemas/UserCreateLinkRole'
import { useRouter } from 'next/navigation'
import { useModal } from '~/contexts/ModalContext'

interface Props {
  role: Role
  redirectUrl: string
}

export default function AddUserForm({ role, redirectUrl }: Props) {
  const { displayModal, hideModal } = useModal()
  const router = useRouter()
  const [emails, setEmails] = useState([''])

  useEffect(() => {
    if (emails[emails.length - 1]) {
      setEmails([...emails, ''])
    }
  }, [emails])

  const handleEmailChange = useCallback(
    (index: number, value: string) => {
      const emails = value.split(' ')
      setEmails((oldEmails) => {
        const newEmails = [...oldEmails]
        newEmails.splice(index, 1, ...emails)
        return newEmails
      })
    },
    [setEmails]
  )

  const handleSubmit = useCallback(async () => {
    try {
      const filteredEmails = emails.filter((email) => email)
      const payload = { emails: filteredEmails, role } as UserCreateLinkRole
      await api.post('/api/user/create-link-role', payload)
      router.push(redirectUrl)
      router.refresh()
    } catch (err) {
      console.log(err)
      displayModal({
        title: 'Error',
        body: 'There was an error creating the users. Please try again.',
        buttons: [
          {
            text: 'Ok',
            onClick: () => hideModal(),
          },
        ],
      })
    }
  }, [emails, role, redirectUrl, router, displayModal, hideModal])

  const errors = useMemo(() => {
    const result = UserCreateLinkRoleZod.safeParse({ emails, role })
    if (result.success) return null

    return result.error.format()
  }, [emails, role])

  return (
    <div className={styles.container}>
      <h1>
        Add to <span>{role}</span>
      </h1>
      <form className={styles.form}>
        {emails.map((email, index) => (
          <FormInput
            label={`Email ${index + 1}:`}
            type="email"
            key={index}
            value={email}
            onChange={(e) => handleEmailChange(index, e.target.value)}
            errors={errors?.emails?.[index]?._errors}
          />
        ))}
        <Button
          color="success"
          type="submit"
          onClick={async (e) => {
            e.preventDefault()
            await handleSubmit()
          }}
        >
          Add Users
        </Button>
      </form>
    </div>
  )
}
