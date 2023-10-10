import { Ref, useEffect } from 'react'

export default function useOnClickOut(
  ref: Ref<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    const listener = (event: any) => {
      if (
        !ref ||
        !('current' in ref) ||
        !ref.current ||
        ref.current.contains(event.target)
      ) {
        return
      }
      callback()
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, callback])
}
