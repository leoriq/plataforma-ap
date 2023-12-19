import classnames from 'classnames'

import styles from './LinkButton.module.scss'
import Link, { type LinkProps } from 'next/link'
import type { ReactNode } from 'react'

type Props = LinkProps & {
  color?: string
  className?: string
  children?: ReactNode
}

export default function LinkButton(props: Props) {
  const className = classnames(
    styles.button,
    props.className,
    props.color ? styles[props.color] : ''
  )

  return <Link {...props} className={className} />
}
