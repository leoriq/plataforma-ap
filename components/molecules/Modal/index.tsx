import { MouseEvent } from 'react'

import Button from '~/components/atoms/Button'

import styles from './Modal.module.scss'

export interface ModalProps {
  title: string
  body: string
  buttons?: {
    text: string
    color?: string

    onClick: (
      e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
    ) => void | Promise<void>
  }[]
}

export default function Modal({ title, body, buttons }: ModalProps) {
  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{body}</p>
        <div className={styles.buttonsContainer}>
          {buttons?.map((button) => (
            <Button
              key={button.text}
              color={button.color}
              onClick={button.onClick}
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
