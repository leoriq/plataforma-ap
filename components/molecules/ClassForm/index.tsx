'use client'

import type { Class, LessonCollection, User } from '@prisma/client'
import Button from '~/components/atoms/Button'
import FormInput from '~/components/atoms/FormInput'
import FormTextArea from '~/components/atoms/FormTextArea'

import { useCallback, useMemo, useState } from 'react'

import styles from './ClassForm.module.scss'
import {
  type ClassCreateRequest,
  ClassCreateRequestZod,
  type ClassUpdateRequest,
  ClassUpdateRequestZod,
} from '~/schemas/ClassRequest'
import { useModal } from '~/contexts/ModalContext'
import { useRouter } from 'next/navigation'
import Select from 'react-select'
import api from '~/utils/api'

interface Props {
  showDelete?: boolean
  collections: LessonCollection[]
  instructors: User[]
  class?: Class & {
    Instructors: User[]
    Students: User[]
  }
}

export default function ClassForm({
  collections,
  instructors,
  class: dbClass,
  showDelete,
}: Props) {
  const { displayModal, hideModal } = useModal()
  const router = useRouter()
  const startingClass = {
    id: dbClass?.id,
    name: dbClass?.name ?? '',
    description: dbClass?.description ?? '',
    archived: dbClass?.archived ?? false,
    lessonCollectionId: dbClass?.lessonCollectionId ?? collections[0]?.id ?? '',
    connectInstructorsIds: dbClass?.Instructors.map((i) => i.id) ?? [],
    connectStudentsEmails: dbClass?.Students.map((s) => s.email) ?? [],
    disconnectStudentsIds: [],
    disconnectInstructorsIds: [],
  }
  const [classData, setClassData] = useState<
    ClassCreateRequest | ClassUpdateRequest
  >(startingClass)

  const [forceShowErrors, setForceShowErrors] = useState(false)
  const errors = useMemo(() => {
    if (dbClass) {
      const result = ClassUpdateRequestZod.safeParse(classData)
      if (result.success) return null

      return result.error.format()
    }
    const result = ClassCreateRequestZod.safeParse(classData)
    if (result.success) return null

    return result.error.format()
  }, [classData, dbClass])

  const handleChange = useCallback(
    (event: { target: { name: string; value: string } }) => {
      const { name, value } = event.target
      setClassData((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    []
  )

  const handleChangeInstructors = useCallback((values: string[]) => {
    setClassData((prev) => ({
      ...prev,
      connectInstructorsIds: values,
    }))
  }, [])

  const instructorOptions = useMemo(
    () =>
      instructors.map((i) => ({
        label: i.fullName ?? i.email,
        value: i.id,
      })),
    [instructors]
  )
  const instructorValues = useMemo(
    () =>
      instructors
        .filter((i) => classData.connectInstructorsIds.includes(i.id))
        .map((i) => ({
          label: i.fullName ?? i.email,
          value: i.id,
        })),
    [instructors, classData.connectInstructorsIds]
  )

  const handleSubmit = useCallback(async () => {
    if (errors) {
      console.error(errors)
      displayModal({
        title: 'Fix the Errors',
        body: 'Please fix the errors before submitting.',
        buttons: [
          {
            text: 'OK',
            onClick: () => {
              hideModal()
            },
          },
        ],
      })
      setForceShowErrors(true)
      return
    }

    try {
      if (dbClass) {
        const disconnectInstructorsIds = dbClass.Instructors.reduce(
          (acc, i) =>
            classData.connectInstructorsIds.includes(i.id)
              ? acc
              : [...acc, i.id],
          [] as string[]
        )

        const payload = {
          ...classData,
          disconnectInstructorsIds,
        }

        await api.put('/api/class', payload)
      } else {
        await api.post('/api/class', classData)
      }
      router.push('/auth/instructor/classes')
      router.refresh()
    } catch (error) {
      console.error(error)
      displayModal({
        title: 'Error',
        body: 'Something went wrong. Please try again.',
        buttons: [
          {
            text: 'OK',
            onClick: () => {
              hideModal()
            },
          },
        ],
      })
    }
  }, [classData, router, displayModal, hideModal, dbClass, errors])

  const handleDelete = useCallback(() => {
    if (!dbClass) return
    async function deleteClass() {
      if (!dbClass) return
      try {
        await api.delete('/api/class', { data: { id: dbClass.id } })
        router.push('/auth/instructor/classes')
        router.refresh()
        hideModal()
      } catch (error) {
        console.error(error)
        displayModal({
          title: 'Error',
          body: 'Something went wrong. Please try again.',
          buttons: [
            {
              text: 'OK',
              onClick: () => {
                hideModal()
              },
            },
          ],
        })
      }
    }

    displayModal({
      title: 'Are you sure?',
      body: 'This will delete the class and all associated data.',
      buttons: [
        {
          text: 'Cancel',
          onClick: () => {
            hideModal()
          },
        },
        {
          text: 'Delete',
          color: 'danger',
          onClick: async () => {
            await deleteClass()
          },
        },
      ],
    })
  }, [dbClass, router, displayModal, hideModal])

  return (
    <div className={styles.container}>
      <h1>{!dbClass ? 'Create' : 'Edit'} Class</h1>

      <form className={styles.form}>
        <FormInput
          label="Name:"
          name="name"
          value={classData.name}
          onChange={handleChange}
          errors={errors?.name?._errors}
          eager={forceShowErrors}
        />
        <FormTextArea
          label="Description:"
          name="description"
          value={classData.description}
          onChange={handleChange}
          errors={errors?.description?._errors}
          eager={forceShowErrors}
        />
        <label>
          Collection:
          <select
            name="lessonCollectionId"
            value={classData.lessonCollectionId}
            placeholder="Select a collection"
            onChange={handleChange}
            className={styles.select}
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Instructors:
          <Select
            className={styles.multiSelect}
            isMulti
            onChange={(data) =>
              handleChangeInstructors(data.map((o) => o.value))
            }
            value={instructorValues}
            options={instructorOptions}
          />
          {forceShowErrors && (
            <p className={styles.instructorErrors}>
              {errors?.connectInstructorsIds?._errors}
            </p>
          )}
        </label>

        <Button
          type="submit"
          color="success"
          onClick={async (e) => {
            e.preventDefault()
            await handleSubmit()
          }}
        >
          {!dbClass ? 'Create Class' : 'Save'}
        </Button>
        {showDelete && (
          <Button type="button" color="danger" onClick={handleDelete}>
            Delete Class
          </Button>
        )}
      </form>
    </div>
  )
}
