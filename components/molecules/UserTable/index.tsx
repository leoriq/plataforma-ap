'use client'

import Button from '../../atoms/Button'
import styles from './UserTable.module.scss'
import { useCallback, useState } from 'react'
import LinkButton from '../../atoms/LinkButton'
import api from '~/utils/api'
import { useModal } from '~/contexts/ModalContext'
import { useRouter } from 'next/navigation'

interface Props {
  title: string
  users: {
    id: string
    fullName: string | null
    email: string
  }[]
  removeUsers?: (ids: string[]) => Promise<void> | void
  removeText?: string
  addUsersLink?: string
  addText?: string
  onClickUser?: (id: string) => void
  canDeleteUser?: boolean
}

export default function UserTable({
  title,
  users,
  removeUsers,
  removeText,
  addUsersLink,
  addText,
  onClickUser,
  canDeleteUser,
}: Props) {
  const { displayModal, hideModal } = useModal()
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const deleteUsersPermanently = useCallback(() => {
    async function deleteUsersPermanently() {
      try {
        await api.delete('/api/user', {
          data: {
            ids: selectedIds,
          },
        })
        hideModal()
        setSelectedIds([])
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
      router.refresh()
    }

    displayModal({
      title: 'Delete Users',
      body: `Are you sure you want to delete ${selectedIds.length} user${
        selectedIds.length > 1 ? 's' : ''
      } permanently?`,
      buttons: [
        {
          text: 'Cancel',
          onClick: hideModal,
        },
        {
          text: 'Delete',
          onClick: deleteUsersPermanently,
          color: 'danger',
        },
      ],
    })
  }, [selectedIds, displayModal, hideModal, router])

  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <div className={styles.buttonsContainer}>
        {!!addUsersLink && (
          <LinkButton color="success" href={addUsersLink}>
            {addText || 'Add New'}
          </LinkButton>
        )}
        {!!removeUsers && !!users.length && (
          <Button
            color="danger"
            type="button"
            className={styles.button}
            onClick={async () => await removeUsers(selectedIds)}
            disabled={selectedIds.length === 0}
          >
            {removeText || 'Remove Selected'}
          </Button>
        )}
        {!!canDeleteUser && !!users.length && (
          <Button
            color="danger"
            type="button"
            className={styles.button}
            onClick={deleteUsersPermanently}
            disabled={selectedIds.length === 0}
          >
            Delete Permanently
          </Button>
        )}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            {(!!removeUsers || canDeleteUser) && !!users.length && (
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === users.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(users.map((user) => user.id))
                    } else {
                      setSelectedIds([])
                    }
                  }}
                />
              </th>
            )}
            <th>Full Name / Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.email}
              className={
                selectedIds.includes(user.id) ? styles.checked : undefined
              }
            >
              {(!!removeUsers || canDeleteUser) && (
                <td className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, user.id])
                      } else {
                        setSelectedIds(
                          selectedIds.filter((id) => id !== user.id)
                        )
                      }
                    }}
                  />
                </td>
              )}
              <td>
                {!onClickUser ? (
                  <p className={styles.name}>{user.fullName || user.email}</p>
                ) : (
                  <button
                    className={styles.onClickButton}
                    type="button"
                    onClick={() => onClickUser(user.id)}
                  >
                    {user.fullName || user.email}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={2}>
                <p className={styles.name}>No {title.toLowerCase()} found.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
