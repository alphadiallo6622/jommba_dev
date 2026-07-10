export interface Testimonial {
  id: string;
  name: string;
  age: number;
  location: string;
  text: string;
  partnerName?: string;
  marriageDate?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Mamadou & Aïssatou",
    age: 28,
    location: "New York, États-Unis",
    text: "Nous étions tous les deux très sceptiques quant aux rencontres en ligne. Jommba a changé notre vision grâce au respect des valeurs religieuses. Nous nous sommes mariés 6 mois après notre premier échange.",
    partnerName: "Aïssatou",
    marriageDate: "Mars 2026",
  },
  {
    id: "2",
    name: "Alpha Oumar & Fatoumata",
    age: 32,
    location: "Lyon, France",
    text: "Ce qui m'a plu sur Jommba, c'est le sérieux des profils. La modération manuelle fait une vraie différence. J'ai rencontré Fatoumata et après avoir impliqué nos familles, nous avons célébré notre union.",
    partnerName: "Fatoumata",
    marriageDate: "Janvier 2026",
  },
  {
    id: "3",
    name: "Kadiatou & Ibrahima",
    age: 26,
    location: "Houston, États-Unis",
    text: "La fonction de floutage des photos m'a permis d'aborder des profils dans le respect de ma pudeur. J'ai pu discuter avec Ibrahima de nos projets de vie avant de lui dévoiler mon visage. Alhamdoulillah, nous sommes très heureux.",
    partnerName: "Ibrahima",
    marriageDate: "Mai 2026",
  },
];

