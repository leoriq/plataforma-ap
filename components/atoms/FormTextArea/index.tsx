'use client'

import {
  type DetailedHTMLProps,
  type TextareaHTMLAttributes,
  useState,
} from 'react'

import styles from './FormTextArea.module.scss'

export default function FormTextArea(
  allProps: DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > & { label: string; errors?: string[]; eager?: boolean }
) {
  const { label, errors, eager, ...props } = allProps

  const [dirty, setDirty] = useState(false)

  const errorsToShow = dirty || eager ? errors : undefined

  return (
    <div className={styles.container}>
      <label className={errorsToShow ? styles.danger : undefined}>
        {label}
        <textarea
          {...props}
          onChange={(e) => {
            setDirty(true)
            props.onChange && props.onChange(e)
          }}
        />
      </label>
      {errorsToShow?.map((error) => (
        <span key={error}>{error}</span>
      ))}
    </div>
  )
}
