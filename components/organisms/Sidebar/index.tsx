'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useSelectedLayoutSegment } from 'next/navigation'
import type { User } from 'next-auth'

import SidebarProfileMenu from '../../atoms/SidebarProfileMenu'
import SidebarItem from '~/components/atoms/SidebarItem'

import CoordinationIcon from '~/components/atoms/icons/CoordinationIcon'
import InstructorsIcon from '~/components/atoms/icons/InstructorsIcon'
import MaterialIcon from '~/components/atoms/icons/MaterialIcon'
import StudentIcon from '~/components/atoms/icons/StudentIcon'

import LogoSVG from '~/public/logos/light-key.svg'

import styles from './Sidebar.module.scss'
import HeaderMobile from '~/components/atoms/HeaderMobile'
import useOnClickOut from '~/utils/useOnClickOut'
import classNames from 'classnames'

interface Props {
  user: User
}

export default function Sidebar({ user }: Props) {
  const [isOpenMobile, setIsOpenMobile] = useState(false)
  const headerRef = useRef(null)
  const navRef = useRef(null)
  useOnClickOut([navRef, headerRef], () => setIsOpenMobile(false))

  const currentSelected = useSelectedLayoutSegment()
  const params = useParams<{ classId?: string }>()
  const classId =
    (currentSelected === 'instructor' && params.classId) || 'redirect'

  const isCoordinator = user.roles.includes('COORDINATOR')
  const isRepInstructor = user.roles.includes('REP_INSTRUCTOR')
  const isInstructor = user.roles.includes('INSTRUCTOR') || isRepInstructor
  const isMaterial = user.roles.includes('MATERIAL')
  const isStudent = user.roles.includes('STUDENT')

  return (
    <>
      <HeaderMobile
        ref={headerRef}
        isOpen={isOpenMobile}
        onClickMenu={() => setIsOpenMobile(!isOpenMobile)}
      />

      <nav
        className={classNames(styles.nav, isOpenMobile && styles.openMobile)}
        ref={navRef}
      >
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
                  href: '/auth/instructor/classes',
                },
                {
                  title: 'Dashboard',
                  href: `/auth/instructor/class/${classId}/dashboard`,
                },
                {
                  title: 'Attendance',
                  href: `/auth/instructor/class/${classId}/attendance`,
                },
                {
                  title: 'Students',
                  href: `/auth/instructor/class/${classId}/students`,
                },
                {
                  title: 'Grade',
                  href: `/auth/instructor/class/${classId}/grade`,
                },
                {
                  title: 'Edit Class',
                  href: `/auth/instructor/class/${classId}/edit`,
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
                  title: 'Collections',
                  href: '/auth/material/collections',
                },
                {
                  title: 'Create New Collection',
                  href: '/auth/material/add-collection',
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
    </>
  )
}
