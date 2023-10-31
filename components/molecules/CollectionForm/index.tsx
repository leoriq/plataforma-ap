'use client'

import { type ChangeEvent, useCallback, useState, useMemo } from 'react'
import Button from '~/components/atoms/Button'
import FormInput from '~/components/atoms/FormInput'
import api from '~/utils/api'

import styles from './CollectionForm.module.scss'
import { useRouter } from 'next/navigation'
import {
  type CollectionRequest,
  CollectionRequestZod,
} from '~/schemas/CollectionRequest'

interface Props {
  startingData?: CollectionRequest
}

export default function CollectionForm({ startingData }: Props) {
  const router = useRouter()
  const [collection, setCollection] = useState<CollectionRequest>(
    startingData ?? {
      name: '',
      description: '',
    }
  )

  const [requestError, setRequestError] = useState('')
  const errors = useMemo(() => {
    const result = CollectionRequestZod.safeParse(collection)
    if (result.success) return null

    return result.error.format()
  }, [collection])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target
      setCollection((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }))
    },
    [setCollection]
  )

  const handleSubmit = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 10000))
      if (collection.id) {
        await api.patch('/api/collection', collection)
      } else {
        await api.post('/api/collection', collection)
      }
      router.push('/auth/material/collections')
      router.refresh()
    } catch (error) {
      setRequestError('Something went wrong. Try again later')
    }
  }, [collection, router])

  return (
    <div className={styles.container}>
      <h1>Create Collection</h1>

      <form className={styles.form}>
        <FormInput
          label="Name"
          name="name"
          onChange={handleChange}
          errors={errors?.name?._errors}
        />
        <FormInput
          label="Description"
          name="description"
          onChange={handleChange}
          errors={errors?.description?._errors}
        />
        {requestError && <p className={styles.error}>{requestError}</p>}
        {collection.id ? (
          <Button
            type="submit"
            onClick={async (e) => {
              e.preventDefault()
              await handleSubmit()
            }}
          >
            Save
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={async (e) => {
              e.preventDefault()
              await handleSubmit()
            }}
            color="success"
          >
            Create
          </Button>
        )}
      </form>
    </div>
  )
}
