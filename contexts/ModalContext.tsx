'use client'

import { ReactNode, createContext, useContext, useState } from 'react'
import Modal, { type ModalProps } from '~/components/molecules/Modal'

interface ModalContextData {
  displayModal: (options: ModalProps) => void
  hideModal: () => void
}

export const ModalContext = createContext<ModalContextData>(
  {} as ModalContextData
)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ModalProps>({
    title: '',
    body: '',
    buttons: [],
  })

  const [showModal, setShowModal] = useState(false)

  function displayModal(options: ModalProps) {
    setOptions(options)
    setShowModal(true)
  }

  function hideModal() {
    setShowModal(false)
    console.log('hideModal')
  }

  return (
    <ModalContext.Provider value={{ displayModal, hideModal }}>
      {showModal && <Modal {...options} />}
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
