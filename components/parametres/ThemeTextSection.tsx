'use client'

import { useState } from 'react'

type Props = {
  label: string
  value: string
  onChange: (v: string) => void
  maxLength: number
  placeholder?: string
  themes?: string[]
  hint?: string
}

export default function ThemeTextSection({ label, value, onChange, maxLength, placeholder, themes, hint }: Props) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {hint && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-2">{hint}</p>
      )}
      <div className={`relative border rounded-xl transition-colors ${focused ? 'border-[#10B981]' : 'border-gray-200'}`}>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value.slice(0, maxLength))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-3 text-sm text-gray-700 bg-transparent rounded-xl resize-none outline-none"
        />
        <span className={`absolute bottom-2 right-3 text-xs ${value.length >= maxLength ? 'text-red-400' : 'text-gray-400'}`}>
          {value.length}/{maxLength}
        </span>
      </div>
      {themes && themes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {themes.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => {
                const sep = value.trim() ? (value.endsWith(' ') ? '' : ' ') : ''
                const next = (value + sep + t).slice(0, maxLength)
                onChange(next)
              }}
              className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full hover:bg-[#E1F5EE] hover:text-[#10B981] transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
