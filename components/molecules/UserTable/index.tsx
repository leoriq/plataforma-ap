'use client'

import Link from 'next/link'
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
}

export default function UserTable({ title, users }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <div className={styles.buttonsContainer}>
        <Button color="danger" className={styles.button}>
          Remove from {title}
        </Button>
        <LinkButton
          color="success"
          className={styles.button}
          href="/auth/coordinator/instructor/add"
        >
          Add Users to {title}
        </LinkButton>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
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
            <th>Full Name</th>
            <th className={styles.email}>Email</th>
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
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([...selectedIds, user.id])
                    } else {
                      setSelectedIds(selectedIds.filter((id) => id !== user.id))
                    }
                  }}
                />
              </td>
              <td>{user.fullName}</td>
              <td className={styles.email}>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
