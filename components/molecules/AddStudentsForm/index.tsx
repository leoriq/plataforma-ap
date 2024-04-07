'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '~/utils/api'
import FormInput from '~/components/atoms/FormInput'
import Button from '~/components/atoms/Button'
import { useParams, useRouter } from 'next/navigation'
import { useModal } from '~/contexts/ModalContext'
import {
  type StudentCreateRequest,
  StudentCreateRequestZod,
} from '~/schemas/StudentRequest'

import styles from './AddStudentsForm.module.scss'

export default function AddStudentForm() {
  const params = useParams()
  const classId = params.classId as string
  const { displayModal, hideModal } = useModal()
  const router = useRouter()
  const [emails, setEmails] = useState([''])

  useEffect(() => {
    if (emails[emails.length - 1]) {
      setEmails([...emails, ''])
    }
  }, [emails])

  const handleEmailChange = useCallback((index: number, value: string) => {
    const emails = value.split(' ')
    setEmails((oldEmails) => {
      const newEmails = [...oldEmails]
      newEmails.splice(index, 1, ...emails)
      return newEmails
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    try {
      const filteredEmails = emails.filter((email) => email)
      const payload: StudentCreateRequest = {
        emails: filteredEmails,
        classId,
      }
      await api.post('/api/class/students', payload)
      router.push(`/auth/instructor/class/${classId}/students`)
      router.refresh()
    } catch (error) {
      console.error(error)
      displayModal({
        title: 'Error',
        body: 'There was an error creating or joining the students. Please try again.',
        buttons: [
          {
            text: 'Ok',
            onClick: () => hideModal(),
          },
        ],
      })
    }
  }, [emails, router, classId, displayModal, hideModal])

  const errors = useMemo(() => {
    const result = StudentCreateRequestZod.safeParse({ emails, classId })
    if (result.success) return null

    return result.error.format()
  }, [emails, classId])

  return (
    <div className={styles.container}>
      <h1>Add Students</h1>
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
          Add Students
        </Button>
      </form>
    </div>
  )
}
