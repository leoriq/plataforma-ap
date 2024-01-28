'use client'

import Button from '../../atoms/Button'
import styles from './UserTable.module.scss'
import { useState } from 'react'
import LinkButton from '../../atoms/LinkButton'

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
}

export default function UserTable({
  title,
  users,
  removeUsers,
  removeText,
  addUsersLink,
  addText,
  onClickUser,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <div className={styles.buttonsContainer}>
        {!!removeUsers && (
          <Button
            color="danger"
            type="button"
            className={styles.button}
            onClick={async () => await removeUsers(selectedIds)}
          >
            {removeText || 'Remove Selected'}
          </Button>
        )}
        {!!addUsersLink && (
          <LinkButton color="success" href={addUsersLink}>
            {addText || 'Add New'}
          </LinkButton>
        )}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            {!!removeUsers && (
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
              {!!removeUsers && (
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
              <td colSpan={2}>No {title.toLowerCase()} found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
