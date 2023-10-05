'use client'

import {
  type MouseEvent,
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  useState,
} from 'react'
import styles from './Button.module.scss'

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export default function Button(
  props: Overwrite<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    {
      onClick?: (
        e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
      ) => Promise<void> | void
    }
  >
) {
  const [loading, setLoading] = useState(false)

  async function handleClick(
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) {
    if (props.onClick) {
      setLoading(true)
      try {
        await props.onClick(e)
      } catch (err) {
        setLoading(false)
        throw err
      }
      setLoading(false)
    }
  }

  const className = [
    styles.button,
    loading ? styles.loading : '',
    props.className,
  ].join(' ')

  return (
    <button
      {...props}
      className={className}
      disabled={loading ? true : props.disabled}
      onClick={(e) => void handleClick(e)}
    />
  )
}
