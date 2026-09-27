// Transition d'entrée à chaque changement de page du dashboard. Le wrapper est
// en `display: contents` (aucun impact de mise en page) et seul le <main> de
// la page est animé : la Navbar fixe reste immobile.
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>
}
