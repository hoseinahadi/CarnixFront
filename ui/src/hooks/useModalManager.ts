import { useEffect } from 'react'

export const useModalManager = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modalOpened'))
    } else {
      window.dispatchEvent(new CustomEvent('modalClosed'))
    }

    return () => {
      window.dispatchEvent(new CustomEvent('modalClosed'))
    }
  }, [isOpen])
}