'use client'

import { useRouter } from 'next/navigation'
import { Heart, Eye } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'

const BLURRED_AVATARS = [1, 5, 9, 12]

export default function ProfileAppreciation() {
  const router = useRouter()
  const { isPremium } = useCurrentUser()

  if (isPremium) return null

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
          <Heart className="w-4 h-4 text-pink-500" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">Ton profil ne passe pas inaperçu</h2>
          <p className="text-xs text-gray-400">4 sœurs apprécient ton profil · 3 likes · 1 favori</p>
        </div>
      </div>

      {/* Blurred avatars row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {BLURRED_AVATARS.map((img, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white"
              style={{ filter: 'blur(5px)' }}
            >
              <img
                src={`https://i.pravatar.cc/80?img=${img}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500">+1</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 ml-1">
          <Eye className="w-3.5 h-3.5 text-violet-400" />
          <span>10 visites de profil</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push('/dashboard/premium')}
        className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
      >
        Découvrir qui s'intéresse à toi →
      </button>
    </div>
  )
}
