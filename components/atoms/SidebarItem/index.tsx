import { useState, type ReactNode, useEffect } from 'react'

import styles from './SidebarItem.module.scss'
import Link from 'next/link'

interface Props {
  icon: ReactNode
  title: string
  isActive?: boolean
  subItems?: {
    title: string
    href: string
    selectable?: boolean
  }[]
}

export default function SidebarItem({
  icon,
  title,
  isActive,
  subItems,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(isActive)
  useEffect(() => {
    isActive && setIsExpanded(true)
  }, [isActive])

  const containerClass = [
    styles.categoryContainer,
    isExpanded ? styles.expanded : undefined,
    isActive ? styles.active : undefined,
  ].join(' ')

  return (
    <div className={containerClass}>
      <button
        className={styles.categoryMain}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {icon}
        <p className={styles.title}>{title}</p>
      </button>

      <div className={styles.categoryItems}>
        {!!subItems &&
          subItems.map((item, index) => (
            <Link key={index} href={item.href} className={styles.categoryItem}>
              {item.title}
            </Link>
          ))}
      </div>
    </div>
  )
}
