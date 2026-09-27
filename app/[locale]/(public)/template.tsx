// Transition d'entrée des pages publiques (la Navbar et le Footer sont dans le
// layout, hors template). Wrapper en `display: contents` : la mise en page
// flex du <main> du layout est inchangée.
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-transition page-transition-all">{children}</div>
}
