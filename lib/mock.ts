import { mockUsers, mockUserFree, MockUser } from '@/lib/mock-user'

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export const MOCK_DELAY = 1000
export const MOCK_OTP = '123456'

const MOCK_CREDENTIALS: Record<string, string> = {
  'abou.diallo@jommba.net': 'abou2024',
  'alphadiallo2308@gmail.com': 'alpha2308',
}

export const mockRegister = async (_data: {
  firstName: string
  lastName: string
  email: string
  password: string
}) => {
  await delay(MOCK_DELAY)
  return { success: true, userId: 'mock-user-001' }
}

export const mockLogin = async (data: { email: string; password: string }): Promise<{ success: boolean; user: MockUser | null; error?: string }> => {
  await delay(MOCK_DELAY)
  const expected = MOCK_CREDENTIALS[data.email.toLowerCase()]
  if (!expected || expected !== data.password) {
    return { success: false, user: null, error: 'Email ou mot de passe incorrect' }
  }
  const user = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase()) ?? mockUserFree
  return { success: true, user }
}

export const mockSendOtp = async (email: string) => {
  await delay(MOCK_DELAY)
  console.info(`[MOCK] OTP envoyé à ${email} : ${MOCK_OTP}`)
  return { success: true }
}

export const mockVerifyOtp = async (code: string) => {
  await delay(MOCK_DELAY)
  return { success: code === MOCK_OTP }
}

export const mockSaveOnboardingStep = async (step: number, data: unknown) => {
  await delay(500)
  console.info(`[MOCK] Étape ${step} sauvegardée`, data)
  return { success: true }
}

export const mockUploadPhoto = async (file: File) => {
  await delay(MOCK_DELAY)
  return { success: true, url: URL.createObjectURL(file) }
}

export const mockSubmitProfile = async () => {
  await delay(MOCK_DELAY)
  return { success: true, validationDelay: '12-24h' }
}
