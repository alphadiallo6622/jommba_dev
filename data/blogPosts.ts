export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Conseils" | "Spiritualité" | "Famille" | "Événements";
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  featured: boolean;
  coverGradient: string; // Dynamic modern gradients instead of static heavy images
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "reussir-ses-rencontres-dans-le-respect-du-cadre-islamique",
    title: "Comment réussir ses rencontres dans le respect du cadre islamique ?",
    excerpt: "Découvrez les principes clés pour mener des discussions sérieuses en vue du mariage (Nikah) tout en préservant votre pudeur et vos valeurs spirituelles.",
    content: "Le mariage est la moitié de notre foi (Deen). Sur Jommba, nous tenons à ce que chaque célibataire puisse entamer ce noble chemin dans le strict respect de l'éthique islamique. Voici comment structurer vos premiers échanges : 1. Définissez vos intentions réelles (Niyyah). 2. Soyez transparent sur vos attentes. 3. Respectez les règles de bienséance (éviter l'isolement ou Khalwah). 4. Impliquez le Wali dès que possible.",
    category: "Spiritualité",
    author: {
      name: "Imam Youssef",
      avatar: "IY",
    },
    date: "14 Mai 2026",
    readTime: "5 min de lecture",
    featured: true,
    coverGradient: "from-emerald-500 to-teal-700",
  },
  {
    slug: "role-du-wali-dans-la-rencontre-halal",
    title: "Quel est le rôle exact du Wali (tuteur) dans le mariage musulman ?",
    excerpt: "Le tuteur n'est pas un obstacle, c'est un protecteur. Comprenez pourquoi et comment l'impliquer sereinement dans votre démarche sur Jommba.",
    content: "Dans le cadre de la rencontre halal, le Wali (le tuteur légal, souvent le père ou un proche de la mariée) joue un rôle fondamental de conseil et de protection. Sa présence permet de poser un cadre rassurant pour les deux futurs conjoints et de légitimer la démarche vis-à-vis des familles.",
    category: "Famille",
    author: {
      name: "Nadia Benali (Conseillère de couple)",
      avatar: "NB",
    },
    date: "10 Mai 2026",
    readTime: "4 min de lecture",
    featured: false,
    coverGradient: "from-teal-600 to-cyan-800",
  },
  {
    slug: "se-preparer-spirituellement-et-psychologiquement-au-mariage",
    title: "Se préparer spirituellement et psychologiquement au mariage",
    excerpt: "Le mariage est un projet de vie. Voici les questions essentielles à se poser et le travail sur soi à mener avant de dire oui.",
    content: "Avant de chercher sa moitié, il est crucial de se chercher soi-même et de comprendre le sens profond de l'engagement dans l'Islam. Cela demande de la maturité émotionnelle, une préparation financière, mais surtout une sincérité spirituelle renouvelée.",
    category: "Conseils",
    author: {
      name: "Imam Youssef",
      avatar: "IY",
    },
    date: "28 Avril 2026",
    readTime: "6 min de lecture",
    featured: false,
    coverGradient: "from-emerald-600 to-green-800",
  },
  {
    slug: "cles-d-un-mariage-musulman-epanoui",
    title: "Les 5 clés indispensables pour un mariage musulman épanoui",
    excerpt: "La communication, la patience et le respect mutuel sont les piliers. Analyse de la Sunnah pour construire un foyer solide.",
    content: "Construire un foyer stable demande des efforts constants des deux côtés. La patience (Sabr), l'affection (Mawaddah) et la miséricorde (Rahmah) mentionnées dans le Coran doivent être au cœur du quotidien des époux.",
    category: "Conseils",
    author: {
      name: "Nadia Benali (Conseillère de couple)",
      avatar: "NB",
    },
    date: "15 Avril 2026",
    readTime: "8 min de lecture",
    featured: false,
    coverGradient: "from-teal-500 to-emerald-700",
  },
];

