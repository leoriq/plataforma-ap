import type { TextareaHTMLAttributes } from 'react'
import classNames from 'classnames'

import styles from './TextArea.module.scss'

export default function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const classes = classNames(styles.textarea, className)
  return <textarea className={classes} {...props} />
}
