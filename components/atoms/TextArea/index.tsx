import type { TextareaHTMLAttributes } from 'react'
import classnames from 'classnames'

import styles from './TextArea.module.scss'

export default function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const classes = classnames(styles.textarea, className)
  return <textarea className={classes} {...props} />
}
