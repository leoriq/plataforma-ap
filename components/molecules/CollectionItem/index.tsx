'use client'

import type { LessonCollection, Lesson } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

import styles from './CollectionItem.module.scss'

import ChevronSVG from '~/public/icons/chevron.svg'
import { useRef, useState } from 'react'
import classNames from 'classnames'
import LinkButton from '~/components/atoms/LinkButton'
import Button from '~/components/atoms/Button'
import api from '~/utils/api'
import { useRouter } from 'next/navigation'
import { useModal } from '~/contexts/ModalContext'

interface Props {
  collection: LessonCollection & {
    Lessons: Lesson[]
  }
}

export default function CollectionItem({ collection }: Props) {
  const [expanded, setExpandedState] = useState(false)
  const expandRef = useRef<HTMLDivElement>(null)
  const expandHeight = expandRef.current?.scrollHeight ?? 0

  const router = useRouter()
  const { displayModal, hideModal } = useModal()

  function setExpanded(toExpand: boolean) {
    if (toExpand) {
      function handleAfterExpand() {
        expandRef.current?.style.removeProperty('max-height')
        expandRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        })
        expandRef.current?.removeEventListener(
          'transitionend',
          handleAfterExpand
        )
      }
      expandRef.current?.addEventListener('transitionend', handleAfterExpand)
      setExpandedState(true)
    } else {
      expandRef.current?.style.setProperty(
        'max-height',
        `${expandRef.current?.scrollHeight}px`
      )
      setExpandedState(false)
    }
  }

  async function deleteCollection() {
    try {
      await api.delete('/api/collection', { data: { id: collection.id } })
      router.push('/auth/material/collections')
      router.refresh()
      hideModal()
    } catch (error) {
      console.log(error)
      displayModal({
        title: 'Error',
        body: 'An error has occurred while deleting the collection. Please try again.',
        buttons: [
          {
            text: 'Close',
            onClick: hideModal,
          },
        ],
      })
    }
  }

  function handleDelete() {
    displayModal({
      title: 'Delete Collection',
      body: 'This will also delete any lessons, questionnaires and grades associated with this collection. Are you sure you want to delete this collection?',
      buttons: [
        {
          text: 'Cancel',
          onClick: hideModal,
        },
        {
          text: 'Delete',
          color: 'danger',
          onClick: deleteCollection,
        },
      ],
    })
  }

  return (
    <li className={classNames(styles.item, expanded && styles.expanded)}>
      <button className={styles.top} onClick={() => setExpanded(!expanded)}>
        <div className={styles.info}>
          <h2>{collection.name}</h2>
          <p>{collection.description}</p>
        </div>
        <div className={styles.chevron}>
          <Image
            src={ChevronSVG as string}
            alt="Expand/Retract"
            width={16}
            height={16}
          />
        </div>
      </button>
      <div
        ref={expandRef}
        className={styles.drawer}
        style={{ maxHeight: expanded ? `${expandHeight}px` : '0px' }}
      >
        <div className={styles.lessons}>
          {collection.Lessons.map((lesson) => (
            <Link
              href={`/auth/material/lessons/${lesson.id}`}
              key={lesson.id}
              className={styles.lesson}
            >
              <h3>{lesson.title}</h3>
            </Link>
          ))}
        </div>
        <LinkButton
          href={`/auth/material/collections/${collection.id}/add-lesson`}
          color="success"
          className={styles.addLesson}
        >
          Create a Lesson
        </LinkButton>
        <LinkButton
          href={`/auth/material/collections/${collection.id}/edit`}
          className={styles.addLesson}
        >
          Edit Collection
        </LinkButton>
        <Button
          color="danger"
          className={styles.addLesson}
          onClick={handleDelete}
        >
          Delete Collection
        </Button>
      </div>
    </li>
  )
}
