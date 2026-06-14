type Props = {
  firstName: string
  lastInitial: string
}

export default function WelcomeScreen({ firstName, lastInitial }: Props) {
  return (
    <div className="text-center px-8">
      <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4 shadow-sm">
        <span className="text-2xl">🙂</span>
      </div>
      <p className="font-bold text-gray-900 text-base mb-2">
        Dis bonjour à {firstName} {lastInitial}.
      </p>
      <p className="text-gray-400 text-sm leading-relaxed">
        Sois respectueux(se) et bienveillant(e)<br />
        dans tes échanges
      </p>
    </div>
  )
}
