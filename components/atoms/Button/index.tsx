'use client'

import {
  type MouseEvent,
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  useState,
} from 'react'
import classnames from 'classnames'

import styles from './Button.module.scss'

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

type Props = Overwrite<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  {
    onClick?: (
      e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
    ) => Promise<void> | void
  } & {
    color?: string
  }
>

export default function Button(props: Props) {
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
  const className = classnames(
    styles.button,
    props.className,
    props.color ? styles[props.color] : '',
    loading ? styles.loading : ''
  )

  return (
    <button
      {...props}
      className={className}
      disabled={loading ? true : props.disabled}
      onClick={(e) => void handleClick(e)}
    />
  )
}
