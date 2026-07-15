'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Sparkles, Loader2 } from 'lucide-react'

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
  const t = useTranslations('dashboard.parametres.themeSection')
  const [focused, setFocused] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)

  const toggleTheme = (theme: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(theme)) next.delete(theme)
      else next.add(theme)
      return next
    })
  }

  const generate = async () => {
    if (!selected.size || generating) return
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themes: Array.from(selected), context: label }),
      })
      const data = await res.json()
      if (data.text) {
        onChange(data.text.slice(0, maxLength))
        setSelected(new Set())
      }
    } catch {
      // silent fail
    } finally {
      setGenerating(false)
    }
  }

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
          {t('counter', { count: value.length, max: maxLength })}
        </span>
      </div>

      {themes && themes.length > 0 && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-gray-500 font-medium">{t('themes')}</p>
          <div className="flex flex-wrap gap-1.5">
            {themes.map(theme => (
              <button
                key={theme}
                type="button"
                onClick={() => toggleTheme(theme)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  selected.has(theme)
                    ? 'bg-[#10B981] border-[#10B981] text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#10B981] hover:text-[#10B981]'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={!selected.size || generating}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
              selected.size && !generating
                ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                : 'bg-gray-100 text-gray-400 cursor-default'
            }`}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('generating')}
              </>
            ) : selected.size > 0 ? (
              <>
                <Sparkles className="w-4 h-4" />
                {t('generate', { count: selected.size })}
              </>
            ) : (
              t('selectThemes')
            )}
          </button>
        </div>
      )}
    </div>
  )
}
