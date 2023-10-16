import { Ref, useEffect } from 'react'

export default function useOnClickOut(
  refs: Ref<HTMLElement>[],
  callback: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (
        refs.some(
          (ref) =>
            !ref ||
            !('current' in ref) ||
            !ref.current ||
            ref.current.contains(event.target as Node)
        )
      ) {
        return
      }
      callback()
    }

    document.addEventListener('mousedown', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
    }
  }, [refs, callback])
}
