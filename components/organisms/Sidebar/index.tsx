'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSelectedLayoutSegment } from 'next/navigation'
import type { User } from 'next-auth'

import SidebarProfileMenu from '../../atoms/SidebarProfileMenu'
import SidebarItem from '~/components/atoms/SidebarItem'

import CoordinationIcon from '~/components/atoms/icons/CoordinationIcon'
import InstructorsIcon from '~/components/atoms/icons/InstructorsIcon'
import MaterialIcon from '~/components/atoms/icons/MaterialIcon'
import StudentIcon from '~/components/atoms/icons/StudentIcon'

import LogoSVG from '~/public/logos/light-key.svg'

import styles from './Sidebar.module.scss'

interface Props {
  user: User
}

export default function Sidebar({ user }: Props) {
  const currentSelected = useSelectedLayoutSegment()

  const isCoordinator = user.roles.includes('COORDINATOR')
  const isRepInstructor = user.roles.includes('REP_INSTRUCTOR')
  const isInstructor = user.roles.includes('INSTRUCTOR') || isRepInstructor
  const isMaterial = user.roles.includes('MATERIAL')
  const isStudent = user.roles.includes('STUDENT')

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.home}>
        <Image src={LogoSVG as string} alt="Logo" height={32} />
        <h1>ENG4U</h1>
      </Link>

      <div className={styles.categories}>
        {isCoordinator && (
          <SidebarItem
            icon={<CoordinationIcon />}
            title="Coordinator"
            isActive={currentSelected === 'coordinator'}
            subItems={[
              {
                title: 'Instructors',
                href: '/auth/coordinator/instructor',
              },
              {
                title: 'Material',
                href: '/auth/coordinator/material',
              },
            ]}
          />
        )}

        {isInstructor && (
          <SidebarItem
            icon={<InstructorsIcon />}
            title="Instructor"
            isActive={currentSelected === 'instructor'}
            subItems={[
              {
                title: 'Select a Class',
                href: '/auth/coordinator/instructor',
                selectable: true,
              },
              {
                title: 'Dashboard',
                href: '/auth/coordinator/material',
              },
              {
                title: 'Attendance',
                href: '/auth/coordinator/material',
              },
              {
                title: 'Students',
                href: '/auth/coordinator/material',
              },
              {
                title: 'Edit Class',
                href: '/auth/coordinator/material',
              },
              {
                title: 'Add New Class',
                href: '/auth/coordinator/material',
              },
            ]}
          />
        )}

        {isMaterial && (
          <SidebarItem
            icon={<MaterialIcon />}
            title="Material"
            isActive={currentSelected === 'material'}
            subItems={[
              {
                title: 'Select a Collection',
                href: '/auth/coordinator/instructor',
                selectable: true,
              },
              {
                title: 'Edit Collection',
                href: '/auth/coordinator/material',
              },
              {
                title: 'Add New Collection',
                href: '/auth/coordinator/material',
              },
            ]}
          />
        )}

        {isStudent && (
          <SidebarItem
            icon={<StudentIcon />}
            title="Student"
            isActive={currentSelected === 'student'}
            subItems={[
              {
                title: 'Select a Class',
                href: '/auth/coordinator/instructor',
                selectable: true,
              },
              {
                title: 'Lessons',
                href: '/auth/coordinator/instructor',
              },
              {
                title: 'Available Activities',
                href: '/auth/coordinator/material',
              },
            ]}
          />
        )}
      </div>

      <div className={styles.profile}>
        <SidebarProfileMenu user={user} />
      </div>
    </nav>
  )
}
