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
  removeUsers?: (ids: string[]) => Promise<void>
  addUsersLink?: string
}

export default function UserTable({
  title,
  users,
  removeUsers,
  addUsersLink,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <div className={styles.buttonsContainer}>
        {!!removeUsers && (
          <Button color="danger" className={styles.button}>
            Remove from {title}
          </Button>
        )}
        {!!addUsersLink && (
          <LinkButton
            color="success"
            className={styles.button}
            href={addUsersLink}
          >
            Add Users to {title}
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
                <td>
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
              <td>{user.fullName || user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
