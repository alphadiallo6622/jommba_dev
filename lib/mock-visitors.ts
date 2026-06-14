export type Visitor = {
  id: number
  photo: string
  firstName: string
  lastInitial: string
  age: number
  city: string
  country: string
  hoursAgo: number
  isNew: boolean
}

export const mockVisitors: Visitor[] = [
  {
    id: 1,
    photo: 'https://i.pravatar.cc/300?img=10',
    firstName: 'Aminata',
    lastInitial: 'D',
    age: 27,
    city: 'Dakar',
    country: 'SN',
    hoursAgo: 16,
    isNew: true,
  },
  {
    id: 2,
    photo: 'https://i.pravatar.cc/300?img=20',
    firstName: 'Fatou',
    lastInitial: 'N',
    age: 31,
    city: 'Thiès',
    country: 'SN',
    hoursAgo: 22,
    isNew: true,
  },
]
