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
import { useModal } from '~/contexts/ModalContext'
import FormTextArea from '~/components/atoms/FormTextArea'

interface Props {
  collection?: CollectionRequest
}

export default function CollectionForm({ collection: startingData }: Props) {
  const router = useRouter()
  const [collection, setCollection] = useState<CollectionRequest>(
    startingData ?? {
      name: '',
      description: '',
    }
  )

  const { displayModal, hideModal } = useModal()

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
    []
  )

  const handleSubmit = useCallback(async () => {
    try {
      if (collection.id) {
        await api.put('/api/collection', collection)
      } else {
        await api.post('/api/collection', collection)
      }
      router.push('/auth/material/collections')
      router.refresh()
    } catch (error) {
      console.log(error)
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
  }, [collection, router, displayModal, hideModal])

  return (
    <div className={styles.container}>
      <h1>{!collection.id ? 'Create' : 'Edit'} Collection</h1>

      <form className={styles.form}>
        <FormInput
          label="Name"
          name="name"
          value={collection.name}
          onChange={handleChange}
          errors={errors?.name?._errors}
        />
        <FormTextArea
          label="Description"
          name="description"
          value={collection.description}
          onChange={handleChange}
          errors={errors?.description?._errors}
        />
        {collection.id ? (
          <Button
            type="submit"
            color="success"
            onClick={async (e) => {
              e.preventDefault()
              await handleSubmit()
            }}
          >
            {!collection.id ? 'Create' : 'Save'}
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
