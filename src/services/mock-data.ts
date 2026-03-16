export const mockBiens = [
  {
    id: 1, reference: 'BIEN-001', categorie: 'Appartement', type_bien: 'T3',
    adresse: '15 Rue du Commerce', ville: 'Lomé', code_postal: '01 BP 1234',
    surface: 85, nombre_pieces: 3, description: 'Bel appartement lumineux au 2ème étage avec balcon',
    loyer_hc: 150000, charges: 25000, depot_garantie: 300000,
    statut: 'loue' as const, photo_url: null,
    locataire_actuel: 'Kofi Mensah', bail_debut: '2024-01-01', bail_fin: '2025-12-31',
    date_creation: '2023-06-15',
  },
  {
    id: 2, reference: 'BIEN-002', categorie: 'Maison', type_bien: 'Villa',
    adresse: '42 Boulevard Circulaire', ville: 'Lomé', code_postal: '01 BP 5678',
    surface: 200, nombre_pieces: 5, description: 'Grande villa avec jardin et garage',
    loyer_hc: 350000, charges: 50000, depot_garantie: 700000,
    statut: 'loue' as const, photo_url: null,
    locataire_actuel: 'Ama Djossou', bail_debut: '2024-03-01', bail_fin: '2026-02-28',
    date_creation: '2023-08-20',
  },
  {
    id: 3, reference: 'BIEN-003', categorie: 'Bureau', type_bien: 'Open Space',
    adresse: '8 Avenue de la Libération', ville: 'Kpalimé', code_postal: '03 BP 112',
    surface: 120, nombre_pieces: 4, description: 'Bureau moderne climatisé en centre-ville',
    loyer_hc: 200000, charges: 35000, depot_garantie: 400000,
    statut: 'vacant' as const, photo_url: null,
    locataire_actuel: null, bail_debut: null, bail_fin: null,
    date_creation: '2024-01-10',
  },
  {
    id: 4, reference: 'BIEN-004', categorie: 'Appartement', type_bien: 'Studio',
    adresse: '23 Rue des Palmiers', ville: 'Sokodé', code_postal: '04 BP 89',
    surface: 35, nombre_pieces: 1, description: 'Studio meublé idéal pour étudiant',
    loyer_hc: 65000, charges: 10000, depot_garantie: 130000,
    statut: 'loue' as const, photo_url: null,
    locataire_actuel: 'Yao Agbeko', bail_debut: '2024-06-01', bail_fin: '2025-05-31',
    date_creation: '2024-02-15',
  },
  {
    id: 5, reference: 'BIEN-005', categorie: 'Local', type_bien: 'Boutique',
    adresse: '5 Marché Central', ville: 'Lomé', code_postal: '01 BP 9012',
    surface: 45, nombre_pieces: 2, description: 'Local commercial bien situé au marché',
    loyer_hc: 120000, charges: 15000, depot_garantie: 240000,
    statut: 'en_travaux' as const, photo_url: null,
    locataire_actuel: null, bail_debut: null, bail_fin: null,
    date_creation: '2024-04-01',
  },
  {
    id: 6, reference: 'BIEN-006', categorie: 'Appartement', type_bien: 'T2',
    adresse: '17 Rue de Calavi', ville: 'Lomé', code_postal: '01 BP 3456',
    surface: 55, nombre_pieces: 2, description: 'Appartement rénové avec cuisine équipée',
    loyer_hc: 95000, charges: 15000, depot_garantie: 190000,
    statut: 'loue' as const, photo_url: null,
    locataire_actuel: 'Afi Koudjo', bail_debut: '2024-09-01', bail_fin: '2025-08-31',
    date_creation: '2024-05-20',
  },
  {
    id: 7, reference: 'BIEN-007', categorie: 'Parking', type_bien: 'Garage',
    adresse: '12 Avenue de la Nouvelle Marche', ville: 'Lomé', code_postal: '01 BP 7890',
    surface: 20, nombre_pieces: 1, description: 'Garage fermé sécurisé',
    loyer_hc: 25000, charges: 0, depot_garantie: 50000,
    statut: 'vacant' as const, photo_url: null,
    locataire_actuel: null, bail_debut: null, bail_fin: null,
    date_creation: '2024-07-01',
  },
  {
    id: 8, reference: 'BIEN-008', categorie: 'Maison', type_bien: 'Duplex',
    adresse: '30 Quartier Administratif', ville: 'Kara', code_postal: '05 BP 234',
    surface: 150, nombre_pieces: 4, description: 'Duplex standing avec piscine',
    loyer_hc: 280000, charges: 40000, depot_garantie: 560000,
    statut: 'loue' as const, photo_url: null,
    locataire_actuel: 'Komlan Assignon', bail_debut: '2024-04-01', bail_fin: '2026-03-31',
    date_creation: '2024-03-10',
  },
  {
    id: 9, reference: 'BIEN-009', categorie: 'Terrain', type_bien: 'Terrain nu',
    adresse: 'Route de Kpalimé, Km 12', ville: 'Tsévié', code_postal: '02 BP 567',
    surface: 500, nombre_pieces: 0, description: 'Terrain nu clôturé, idéal pour construction',
    loyer_hc: 45000, charges: 0, depot_garantie: 90000,
    statut: 'vacant' as const, photo_url: null,
    locataire_actuel: null, bail_debut: null, bail_fin: null,
    date_creation: '2024-08-15',
  },
];

export const mockDashboardStats = {
  total_biens: 9,
  baux_actifs: 5,
  revenus_mois: 965000,
  loyers_impayes: 2,
  evolution_revenus: 8.5,
  evolution_baux: 0,
  evolution_impayes: -15,
};

export const mockRevenueChart = [
  { mois: 'Avr', revenus: 820000, depenses: 145000 },
  { mois: 'Mai', revenus: 850000, depenses: 180000 },
  { mois: 'Juin', revenus: 870000, depenses: 95000 },
  { mois: 'Juil', revenus: 900000, depenses: 220000 },
  { mois: 'Août', revenus: 880000, depenses: 130000 },
  { mois: 'Sep', revenus: 920000, depenses: 160000 },
  { mois: 'Oct', revenus: 910000, depenses: 110000 },
  { mois: 'Nov', revenus: 930000, depenses: 200000 },
  { mois: 'Déc', revenus: 950000, depenses: 175000 },
  { mois: 'Jan', revenus: 940000, depenses: 140000 },
  { mois: 'Fév', revenus: 955000, depenses: 165000 },
  { mois: 'Mar', revenus: 965000, depenses: 190000 },
];

export const mockAlertes = [
  { id: 1, type: 'loyer_impaye' as const, message: 'Loyer impayé pour BIEN-001 — Kofi Mensah (Mars 2026)', date: '2026-03-10', bien_id: 1, lu: false },
  { id: 2, type: 'fin_bail' as const, message: 'Bail BIEN-004 expire dans 60 jours (Yao Agbeko)', date: '2026-03-05', bien_id: 4, lu: false },
  { id: 3, type: 'revision_loyer' as const, message: 'Révision annuelle du loyer pour BIEN-002 prévue le 01/03/2026', date: '2026-02-28', bien_id: 2, lu: true },
  { id: 4, type: 'loyer_impaye' as const, message: 'Loyer impayé pour BIEN-006 — Afi Koudjo (Février 2026)', date: '2026-02-15', bien_id: 6, lu: false },
  { id: 5, type: 'fin_bail' as const, message: 'Bail BIEN-001 expire dans 90 jours (Kofi Mensah)', date: '2026-01-20', bien_id: 1, lu: true },
];

export const mockBienStatuts = {
  loues: 5,
  vacants: 3,
  en_travaux: 1,
};

export const mockCurrentUser = {
  id: 1,
  nom: 'Esso',
  prenom: 'Kodjo',
  email: 'kodjo.esso@loxis.com',
  role: 'proprietaire' as const,
  telephone: '+228 90 12 34 56',
};

export const mockCategories = [
  { id: 1, nom: 'Appartement', actif: true },
  { id: 2, nom: 'Maison', actif: true },
  { id: 3, nom: 'Bureau', actif: true },
  { id: 4, nom: 'Local', actif: true },
  { id: 5, nom: 'Parking', actif: true },
  { id: 6, nom: 'Terrain', actif: true },
];

export const mockTypesBien: Record<string, string[]> = {
  Appartement: ['Studio', 'T1', 'T2', 'T3', 'T4', 'T5+'],
  Maison: ['Villa', 'Duplex', 'Maison simple', 'Maison de ville'],
  Bureau: ['Open Space', 'Bureau fermé', 'Coworking'],
  Local: ['Boutique', 'Entrepôt', 'Atelier'],
  Parking: ['Garage', 'Place extérieure', 'Box'],
  Terrain: ['Terrain nu', 'Terrain viabilisé'],
};

export const mockDepenses = [
  { id: 1, bien_id: 1, libelle: 'Réparation plomberie', montant: 45000, date: '2026-02-15', categorie: 'Entretien' },
  { id: 2, bien_id: 5, libelle: 'Peinture intérieure', montant: 120000, date: '2026-01-20', categorie: 'Travaux' },
  { id: 3, bien_id: 2, libelle: 'Remplacement climatiseur', montant: 85000, date: '2026-03-01', categorie: 'Équipement' },
];

export const mockBaux = [
  { id: 1, bien_id: 1, locataire: 'Kofi Mensah', date_debut: '2024-01-01', date_fin: '2025-12-31', loyer: 150000, statut: 'actif' },
  { id: 2, bien_id: 2, locataire: 'Ama Djossou', date_debut: '2024-03-01', date_fin: '2026-02-28', loyer: 350000, statut: 'actif' },
];
