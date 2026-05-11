import type { ReactNode } from 'react'

type PlayerControlButtonProps = {
  children: ReactNode
  label: string
  onClick: () => void
}

export function PlayerControlButton({
  children,
  label,
  onClick,
}: PlayerControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-blue-500"
    >
      {children}
    </button>
  )
}
