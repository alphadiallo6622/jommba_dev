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
    name: "Yassine & Sarah",
    age: 28,
    location: "Lyon, France",
    text: "Nous étions tous les deux très sceptiques quant aux rencontres en ligne. Jommba a changé notre vision grâce au respect des valeurs religieuses. Nous nous sommes mariés 6 mois après notre premier échange.",
    partnerName: "Sarah",
    marriageDate: "Septembre 2024",
  },
  {
    id: "2",
    name: "Amine & Leyla",
    age: 32,
    location: "Bruxelles, Belgique",
    text: "Ce qui m'a plu sur Jommba, c'est le sérieux des profils. La modération manuelle fait une vraie différence. J'ai rencontré Leyla et après avoir impliqué nos familles, nous avons célébré notre union.",
    partnerName: "Leyla",
    marriageDate: "Janvier 2025",
  },
  {
    id: "3",
    name: "Khadija & Sofiane",
    age: 26,
    location: "Marseille, France",
    text: "La fonction de floutage des photos m'a permis d'aborder des profils dans le respect de ma pudeur. J'ai pu discuter avec Sofiane de nos projets de vie avant de lui dévoiler mon visage. Alhamdoulillah, nous sommes très heureux.",
    partnerName: "Sofiane",
    marriageDate: "Novembre 2024",
  },
];

