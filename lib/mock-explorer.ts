export type ExplorerProfile = {
  id: number
  firstName: string
  lastInitial: string
  age: number
  location: string
  maritalStatus: string
  job: string
  photos: string[]
  isEnAvant: boolean
  marriageVision: string
  ceQueJeRecherche: string
  centresInteret: string
  mesQualites: string
  info: {
    madhhab: string
    education: string
    enfants: string
    souhaitEnfants: string
    peutDemenager: string
    polygamie: string
  }
}

export const MOCK_PROFILES: ExplorerProfile[] = [
  {
    id: 1, firstName: 'Fa', lastInitial: 'D', age: 47,
    location: 'Diaspora FR • Originaire SN Sénégal',
    maritalStatus: 'Divorcé(e)', job: 'Animatrice péri...',
    photos: ['https://i.pravatar.cc/400?img=47'],
    isEnAvant: true,
    marriageVision: 'Le mariage est une ancre solide, où foi et amour se rejoignent.',
    ceQueJeRecherche: "Je cherche quelqu'un qui craint son créateur Allah, sincère, et agit avec douceur et bienveillance.",
    centresInteret: "J'aime les balades, aller de temps en temps au restau, au ciné. Je fais également du sport en salle.",
    mesQualites: "Je suis bienveillante autour de moi et très à l'écoute. Je suis loyale et très gentille.",
    info: { madhhab: 'Maliki', education: 'Baccalauréat', enfants: '1 enfant(s)', souhaitEnfants: "J'en ai déjà", peutDemenager: 'Oui', polygamie: "N'accepte pas" }
  },
  {
    id: 2, firstName: 'Fama', lastInitial: 'N', age: 29,
    location: 'SN Thiès, Sénégal',
    maritalStatus: 'Célibataire', job: 'Agent de s...',
    photos: ['https://i.pravatar.cc/400?img=29'],
    isEnAvant: true,
    marriageVision: "Je cherche un partenaire sincère et pieux pour construire un foyer solide.",
    ceQueJeRecherche: "Quelqu'un de sérieux et pratiquant, avec de bonnes valeurs familiales.",
    centresInteret: 'Lecture, cuisine, sport.', mesQualites: 'Honnête et sérieuse.',
    info: { madhhab: 'Maliki', education: 'Bac+3', enfants: '0', souhaitEnfants: "J'en veux", peutDemenager: 'Non', polygamie: 'Non' }
  },
  {
    id: 3, firstName: 'Ndeye', lastInitial: 'G', age: 46,
    location: 'Diaspora CA • Originaire SN Sénégal',
    maritalStatus: 'Divorcé(e)', job: 'Travaille...',
    photos: ['https://i.pravatar.cc/400?img=46'],
    isEnAvant: true,
    marriageVision: 'La foi avant tout. Je cherche une union bénie et durable.',
    ceQueJeRecherche: 'Un homme mature et posé, craignant Allah.',
    centresInteret: 'Voyages, cuisine, lecture islamique.',
    mesQualites: 'Discrète et fiable, très organisée.',
    info: { madhhab: 'Maliki', education: 'Bac+5', enfants: '2', souhaitEnfants: 'Indifférent', peutDemenager: 'Oui', polygamie: 'À discuter' }
  },
  {
    id: 4, firstName: 'Fatou', lastInitial: 'K', age: 49,
    location: 'SN Dakar, Sénégal',
    maritalStatus: 'Divorcé(e)', job: 'Commerçant...',
    photos: ['https://i.pravatar.cc/400?img=49'],
    isEnAvant: true,
    marriageVision: 'Cherche la stabilité et la sérénité dans un foyer islamique.',
    ceQueJeRecherche: "Quelqu'un de responsable et mature.",
    centresInteret: 'Commerce, famille, sorties halal.',
    mesQualites: 'Travailleuse et pieuse.',
    info: { madhhab: 'Shafi', education: 'Bac', enfants: '3', souhaitEnfants: "J'en ai déjà", peutDemenager: 'Non', polygamie: 'Non' }
  },
  {
    id: 5, firstName: 'Aïssatou', lastInitial: 'B', age: 27,
    location: 'SN Dakar, Sénégal',
    maritalStatus: 'Célibataire', job: 'Infirmière',
    photos: ['https://i.pravatar.cc/400?img=27'],
    isEnAvant: false,
    marriageVision: "Le mariage est une sunnah que je souhaite honorer avec sérieux.",
    ceQueJeRecherche: "Un homme pieux, travailleur et respectueux de sa famille.",
    centresInteret: "Médecine, lecture, cuisine africaine.",
    mesQualites: "Patiente, douce, sérieuse dans mes engagements.",
    info: { madhhab: 'Maliki', education: 'Bac+3', enfants: '0', souhaitEnfants: "J'en veux", peutDemenager: 'Selon les conditions', polygamie: 'Non' }
  },
  {
    id: 6, firstName: 'Mariama', lastInitial: 'S', age: 33,
    location: 'Diaspora FR • Originaire GN Guinée',
    maritalStatus: 'Célibataire', job: 'Comptable',
    photos: ['https://i.pravatar.cc/400?img=33'],
    isEnAvant: false,
    marriageVision: "Trouver un compagnon de route pour ce monde et l'au-delà.",
    ceQueJeRecherche: "Un homme cultivé, pieux, stable financièrement.",
    centresInteret: "Cinéma, voyages, cuisine.",
    mesQualites: "Autonome, souriante, très organisée.",
    info: { madhhab: 'Maliki', education: 'Bac+5', enfants: '0', souhaitEnfants: "J'en veux", peutDemenager: 'Non', polygamie: 'Accepte pas' }
  },
  {
    id: 7, firstName: 'Rokhaya', lastInitial: 'D', age: 38,
    location: 'SN Diourbel, Sénégal',
    maritalStatus: 'Veuve', job: 'Enseignante',
    photos: ['https://i.pravatar.cc/400?img=38'],
    isEnAvant: false,
    marriageVision: "Après une épreuve, je cherche la paix et la sérénité dans un nouveau foyer.",
    ceQueJeRecherche: "Un homme doux et compréhensif, bon père.",
    centresInteret: "Éducation, lectures islamiques, jardinage.",
    mesQualites: "Forte, patiente, bonne pédagogue.",
    info: { madhhab: 'Maliki', education: 'Bac+4', enfants: '2', souhaitEnfants: "J'en ai déjà", peutDemenager: 'Oui', polygamie: 'À discuter' }
  },
  {
    id: 8, firstName: 'Khadidiatou', lastInitial: 'C', age: 24,
    location: 'SN Kaolack, Sénégal',
    maritalStatus: 'Célibataire', job: 'Étudiante',
    photos: ['https://i.pravatar.cc/400?img=24'],
    isEnAvant: false,
    marriageVision: "Je souhaite me marier après mes études pour construire quelque chose de solide.",
    ceQueJeRecherche: "Un jeune homme pieux, ambitieux et respectueux.",
    centresInteret: "Études, sport, cuisine.",
    mesQualites: "Studieuse, discrète, pieuse.",
    info: { madhhab: 'Maliki', education: 'Bac+2', enfants: '0', souhaitEnfants: "J'en veux", peutDemenager: 'Oui', polygamie: 'Non' }
  },
  {
    id: 9, firstName: 'Awa', lastInitial: 'T', age: 42,
    location: 'Diaspora BE • Originaire SN Sénégal',
    maritalStatus: 'Divorcé(e)', job: 'Aide-soignante',
    photos: ['https://i.pravatar.cc/400?img=42'],
    isEnAvant: false,
    marriageVision: "La stabilité et la bienveillance, dans la crainte d'Allah.",
    ceQueJeRecherche: "Un homme mature, posé, avec de bonnes valeurs.",
    centresInteret: "Santé, famille, sorties nature.",
    mesQualites: "Empathique, courageuse, travailleuse.",
    info: { madhhab: 'Maliki', education: 'Bac+2', enfants: '1', souhaitEnfants: "J'en ai déjà", peutDemenager: 'Non', polygamie: 'Accepte pas' }
  },
  {
    id: 10, firstName: 'Penda', lastInitial: 'F', age: 31,
    location: 'SN Ziguinchor, Sénégal',
    maritalStatus: 'Célibataire', job: 'Juriste',
    photos: ['https://i.pravatar.cc/400?img=31'],
    isEnAvant: false,
    marriageVision: "Le droit et la foi se rejoignent : un mariage juste et équilibré.",
    ceQueJeRecherche: "Un homme instruit, respectueux, pratiquant.",
    centresInteret: "Droit, voyages, lectures.",
    mesQualites: "Intelligente, déterminée, droite.",
    info: { madhhab: 'Maliki', education: 'Bac+5', enfants: '0', souhaitEnfants: "J'en veux", peutDemenager: 'Oui', polygamie: 'Non' }
  },
  {
    id: 11, firstName: 'Sokhna', lastInitial: 'M', age: 36,
    location: 'Diaspora CA • Originaire ML Mali',
    maritalStatus: 'Célibataire', job: 'Pharmacienne',
    photos: ['https://i.pravatar.cc/400?img=36'],
    isEnAvant: false,
    marriageVision: "Un foyer de sérénité, de respect mutuel et de foi partagée.",
    ceQueJeRecherche: "Un homme sérieux, bien éduqué, pratiquant avec modération.",
    centresInteret: "Médecine, lecture, sport.",
    mesQualites: "Professionnelle, douce, loyale.",
    info: { madhhab: 'Maliki', education: 'Bac+5', enfants: '0', souhaitEnfants: "J'en veux", peutDemenager: 'Selon les conditions', polygamie: 'Non' }
  },
  {
    id: 12, firstName: 'Coumba', lastInitial: 'N', age: 26,
    location: 'SN Saint-Louis, Sénégal',
    maritalStatus: 'Célibataire', job: 'Commerciale',
    photos: ['https://i.pravatar.cc/400?img=26'],
    isEnAvant: false,
    marriageVision: "Je cherche un compagnon sincère pour bâtir une belle vie ensemble.",
    ceQueJeRecherche: "Un homme travailleur, honnête, respectueux de sa famille.",
    centresInteret: "Commerce, musique, cuisine.",
    mesQualites: "Dynamique, souriante, généreuse.",
    info: { madhhab: 'Maliki', education: 'Bac+2', enfants: '0', souhaitEnfants: "J'en veux", peutDemenager: 'Oui', polygamie: 'Non' }
  },
]
