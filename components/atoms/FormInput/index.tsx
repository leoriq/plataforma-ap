'use client'

import {
  type DetailedHTMLProps,
  type InputHTMLAttributes,
  useState,
} from 'react'

import styles from './FormInput.module.scss'

export default function FormInput(
  allProps: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & { label: string; errors?: string[]; eager?: boolean }
) {
  const { label, errors, eager, ...props } = allProps

  const [dirty, setDirty] = useState(false)

  const errorsToShow = dirty || eager ? errors : undefined

  return (
    <div className={styles.container}>
      <label className={errorsToShow ? styles.danger : undefined}>
        {label}
        <input
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
