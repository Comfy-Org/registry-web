import { Button, FloatingLabel } from 'flowbite-react'
import React from 'react'
import { MdClear } from 'react-icons/md'

export const ClearableLabel: React.FC<{
  id: string
  label: string
  value: string
  disabled?: boolean
  onClear: () => void
  onChange: (value: string) => void
}> = ({ label, value, onClear, onChange, id, disabled = false }) => {
  return (
    <div className="relative flex items-center">
      <FloatingLabel
        id={id}
        type="text"
        className="w-64"
        variant="filled"
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {value && (
        <Button
          onClick={onClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          type="button"
          color="cyan"
          aria-label="Clear"
          size="xs"
        >
          <MdClear size="15px" color="black" />
        </Button>
      )}
    </div>
  )
}
