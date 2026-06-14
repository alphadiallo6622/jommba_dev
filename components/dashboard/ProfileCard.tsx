'use client'

import { useState } from 'react'
import { Star, MapPin, Briefcase } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  id: number
  name: string
  age: number
  city: string
  job: string
  score: number
  img: number
}

function scoreColor(score: number) {
  if (score >= 90) return 'bg-green-500'
  if (score >= 80) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function ProfileCard({ id, name, age, city, job, score, img }: ProfileCardProps) {
  const router = useRouter()
  const [favorite, setFavorite] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      {/* Photo container */}
      <div
        className="relative rounded-[10px] overflow-hidden aspect-[3/4] cursor-pointer"
        onClick={() => router.push(`/dashboard/profil/${id}`)}
      >
        <img
          src={`https://i.pravatar.cc/300?img=${img}`}
          alt={name}
          className="w-full h-full object-cover"
        />

        {/* Favorite star */}
        <button
          onClick={(e) => { e.stopPropagation(); setFavorite(f => !f) }}
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50"
          aria-label="Ajouter aux favoris"
        >
          <Star
            className={cn('w-3.5 h-3.5 transition-colors', favorite ? 'fill-amber-400 text-amber-400' : 'text-white')}
          />
        </button>

        {/* Name + age badge (bottom-left) */}
        <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
          <span className="text-white text-[10px] font-semibold">{name}, {age}</span>
        </div>

        {/* Score badge (bottom-right) */}
        <div className={cn('absolute bottom-2 right-2 rounded-full px-2 py-0.5', scoreColor(score))}>
          <span className="text-white text-xs font-bold">{score}%</span>
        </div>
      </div>

      {/* Info below photo */}
      <div className="px-0.5">
        <div className="flex items-center gap-1 text-gray-500">
          <Briefcase className="w-3 h-3 shrink-0" />
          <span className="text-[11px] truncate">{job}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 mt-0.5">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="text-[11px]">{city}</span>
        </div>
      </div>
    </div>
  )
}
