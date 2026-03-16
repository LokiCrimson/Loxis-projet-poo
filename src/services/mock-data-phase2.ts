// ===== LOCATAIRES =====
export const mockLocataires = [
  {
    id: 1, nom: 'Mensah', prenom: 'Kofi', email: 'kofi.mensah@email.com',
    telephone: '+228 90 12 34 56', date_naissance: '1985-03-15',
    profession: 'Ingénieur informatique', actif: true,
    piece_identite_type: 'cni' as const, piece_identite_numero: 'CI-2024-00456',
    adresse_precedente: '8 Rue des Cocotiers, Lomé',
    date_creation: '2023-12-20',
    garant: {
      id: 1, nom: 'Mensah', prenom: 'Akua', telephone: '+228 91 23 45 67',
      email: 'akua.mensah@email.com', profession: 'Médecin',
      revenu_mensuel: 800000, entite: 'Hôpital Universitaire de Lomé',
      entite_id: 'ENT-001', details: 'Mère du locataire',
    },
  },
  {
    id: 2, nom: 'Djossou', prenom: 'Ama', email: 'ama.djossou@email.com',
    telephone: '+228 92 34 56 78', date_naissance: '1990-07-22',
    profession: 'Comptable', actif: true,
    piece_identite_type: 'passeport' as const, piece_identite_numero: 'PS-TG-2023-789',
    adresse_precedente: '15 Avenue de la Paix, Lomé',
    date_creation: '2024-02-10',
    garant: {
      id: 2, nom: 'Djossou', prenom: 'Koffi', telephone: '+228 93 45 67 89',
      email: 'koffi.djossou@email.com', profession: 'Entrepreneur',
      revenu_mensuel: 1200000, entite: 'Djossou & Fils SARL',
      entite_id: 'ENT-002', details: 'Père du locataire',
    },
  },
  {
    id: 3, nom: 'Agbeko', prenom: 'Yao', email: 'yao.agbeko@email.com',
    telephone: '+228 94 56 78 90', date_naissance: '1998-11-03',
    profession: 'Étudiant', actif: true,
    piece_identite_type: 'cni' as const, piece_identite_numero: 'CI-2024-01234',
    adresse_precedente: null,
    date_creation: '2024-05-25',
    garant: {
      id: 3, nom: 'Agbeko', prenom: 'Esi', telephone: '+228 95 67 89 01',
      email: 'esi.agbeko@email.com', profession: 'Enseignante',
      revenu_mensuel: 450000, entite: 'Lycée de Sokodé',
      entite_id: 'ENT-003', details: 'Mère du locataire',
    },
  },
  {
    id: 4, nom: 'Koudjo', prenom: 'Afi', email: 'afi.koudjo@email.com',
    telephone: '+228 96 78 90 12', date_naissance: '1992-05-18',
    profession: 'Commerçante', actif: true,
    piece_identite_type: 'cni' as const, piece_identite_numero: 'CI-2024-05678',
    adresse_precedente: '3 Quartier Bè, Lomé',
    date_creation: '2024-08-15',
    garant: null,
  },
  {
    id: 5, nom: 'Assignon', prenom: 'Komlan', email: 'komlan.assignon@email.com',
    telephone: '+228 97 89 01 23', date_naissance: '1988-09-30',
    profession: 'Architecte', actif: true,
    piece_identite_type: 'passeport' as const, piece_identite_numero: 'PS-TG-2024-456',
    adresse_precedente: '25 Rue de Kara',
    date_creation: '2024-03-05',
    garant: {
      id: 5, nom: 'Assignon', prenom: 'Ama', telephone: '+228 98 90 12 34',
      email: 'ama.assignon@email.com', profession: 'Banquière',
      revenu_mensuel: 950000, entite: 'UTB Kara',
      entite_id: 'ENT-005', details: 'Épouse du locataire',
    },
  },
];

// ===== BAUX =====
export const mockBauxFull = [
  {
    id: 1, reference: 'BAIL-001', bien_id: 1, bien_reference: 'BIEN-001',
    bien_adresse: '15 Rue du Commerce, Lomé',
    locataire_id: 1, locataire_nom: 'Kofi Mensah',
    date_debut: '2024-01-01', date_fin: '2025-12-31',
    loyer_initial: 150000, loyer_actuel: 150000, charges: 25000,
    depot_garantie_verse: 300000, depot_remise_motif: null,
    statut: 'actif' as const, motif_fin: null,
    date_creation: '2023-12-28',
  },
  {
    id: 2, reference: 'BAIL-002', bien_id: 2, bien_reference: 'BIEN-002',
    bien_adresse: '42 Boulevard Circulaire, Lomé',
    locataire_id: 2, locataire_nom: 'Ama Djossou',
    date_debut: '2024-03-01', date_fin: '2026-02-28',
    loyer_initial: 350000, loyer_actuel: 350000, charges: 50000,
    depot_garantie_verse: 700000, depot_remise_motif: null,
    statut: 'actif' as const, motif_fin: null,
    date_creation: '2024-02-25',
  },
  {
    id: 3, reference: 'BAIL-003', bien_id: 4, bien_reference: 'BIEN-004',
    bien_adresse: '23 Rue des Palmiers, Sokodé',
    locataire_id: 3, locataire_nom: 'Yao Agbeko',
    date_debut: '2024-06-01', date_fin: '2025-05-31',
    loyer_initial: 65000, loyer_actuel: 65000, charges: 10000,
    depot_garantie_verse: 130000, depot_remise_motif: null,
    statut: 'actif' as const, motif_fin: null,
    date_creation: '2024-05-28',
  },
  {
    id: 4, reference: 'BAIL-004', bien_id: 6, bien_reference: 'BIEN-006',
    bien_adresse: '17 Rue de Calavi, Lomé',
    locataire_id: 4, locataire_nom: 'Afi Koudjo',
    date_debut: '2024-09-01', date_fin: '2025-08-31',
    loyer_initial: 95000, loyer_actuel: 95000, charges: 15000,
    depot_garantie_verse: 190000, depot_remise_motif: null,
    statut: 'actif' as const, motif_fin: null,
    date_creation: '2024-08-28',
  },
  {
    id: 5, reference: 'BAIL-005', bien_id: 8, bien_reference: 'BIEN-008',
    bien_adresse: '30 Quartier Administratif, Kara',
    locataire_id: 5, locataire_nom: 'Komlan Assignon',
    date_debut: '2024-04-01', date_fin: '2026-03-31',
    loyer_initial: 280000, loyer_actuel: 280000, charges: 40000,
    depot_garantie_verse: 560000, depot_remise_motif: null,
    statut: 'actif' as const, motif_fin: null,
    date_creation: '2024-03-28',
  },
  {
    id: 6, reference: 'BAIL-006', bien_id: 3, bien_reference: 'BIEN-003',
    bien_adresse: '8 Avenue de la Libération, Kpalimé',
    locataire_id: 2, locataire_nom: 'Ama Djossou',
    date_debut: '2023-01-01', date_fin: '2023-12-31',
    loyer_initial: 180000, loyer_actuel: 180000, charges: 30000,
    depot_garantie_verse: 360000, depot_remise_motif: 'Fin de bail',
    statut: 'termine' as const, motif_fin: 'Fin de bail à échéance',
    date_creation: '2022-12-20',
  },
];

// ===== PAIEMENTS =====
export const mockPaiements = [
  { id: 1, bail_id: 1, locataire: 'Kofi Mensah', bien_reference: 'BIEN-001', periode_mois: 1, periode_annee: 2026, montant_attendu: 175000, montant_paye: 175000, reste_a_payer: 0, date_paiement: '2026-01-05', reference: 'PAY-2026-001', moyen: 'virement' as const, statut: 'paye' as const, commentaire: null },
  { id: 2, bail_id: 1, locataire: 'Kofi Mensah', bien_reference: 'BIEN-001', periode_mois: 2, periode_annee: 2026, montant_attendu: 175000, montant_paye: 175000, reste_a_payer: 0, date_paiement: '2026-02-03', reference: 'PAY-2026-002', moyen: 'virement' as const, statut: 'paye' as const, commentaire: null },
  { id: 3, bail_id: 1, locataire: 'Kofi Mensah', bien_reference: 'BIEN-001', periode_mois: 3, periode_annee: 2026, montant_attendu: 175000, montant_paye: 0, reste_a_payer: 175000, date_paiement: null, reference: 'PAY-2026-003', moyen: null, statut: 'en_attente' as const, commentaire: null },
  { id: 4, bail_id: 2, locataire: 'Ama Djossou', bien_reference: 'BIEN-002', periode_mois: 1, periode_annee: 2026, montant_attendu: 400000, montant_paye: 400000, reste_a_payer: 0, date_paiement: '2026-01-02', reference: 'PAY-2026-004', moyen: 'cheque' as const, statut: 'paye' as const, commentaire: null },
  { id: 5, bail_id: 2, locataire: 'Ama Djossou', bien_reference: 'BIEN-002', periode_mois: 2, periode_annee: 2026, montant_attendu: 400000, montant_paye: 400000, reste_a_payer: 0, date_paiement: '2026-02-01', reference: 'PAY-2026-005', moyen: 'virement' as const, statut: 'paye' as const, commentaire: null },
  { id: 6, bail_id: 2, locataire: 'Ama Djossou', bien_reference: 'BIEN-002', periode_mois: 3, periode_annee: 2026, montant_attendu: 400000, montant_paye: 400000, reste_a_payer: 0, date_paiement: '2026-03-01', reference: 'PAY-2026-006', moyen: 'virement' as const, statut: 'paye' as const, commentaire: null },
  { id: 7, bail_id: 3, locataire: 'Yao Agbeko', bien_reference: 'BIEN-004', periode_mois: 1, periode_annee: 2026, montant_attendu: 75000, montant_paye: 75000, reste_a_payer: 0, date_paiement: '2026-01-08', reference: 'PAY-2026-007', moyen: 'especes' as const, statut: 'paye' as const, commentaire: null },
  { id: 8, bail_id: 3, locataire: 'Yao Agbeko', bien_reference: 'BIEN-004', periode_mois: 2, periode_annee: 2026, montant_attendu: 75000, montant_paye: 50000, reste_a_payer: 25000, date_paiement: '2026-02-10', reference: 'PAY-2026-008', moyen: 'especes' as const, statut: 'partiel' as const, commentaire: 'Paiement partiel, solde attendu le 15' },
  { id: 9, bail_id: 3, locataire: 'Yao Agbeko', bien_reference: 'BIEN-004', periode_mois: 3, periode_annee: 2026, montant_attendu: 75000, montant_paye: 0, reste_a_payer: 75000, date_paiement: null, reference: 'PAY-2026-009', moyen: null, statut: 'en_attente' as const, commentaire: null },
  { id: 10, bail_id: 4, locataire: 'Afi Koudjo', bien_reference: 'BIEN-006', periode_mois: 1, periode_annee: 2026, montant_attendu: 110000, montant_paye: 110000, reste_a_payer: 0, date_paiement: '2026-01-04', reference: 'PAY-2026-010', moyen: 'virement' as const, statut: 'paye' as const, commentaire: null },
  { id: 11, bail_id: 4, locataire: 'Afi Koudjo', bien_reference: 'BIEN-006', periode_mois: 2, periode_annee: 2026, montant_attendu: 110000, montant_paye: 0, reste_a_payer: 110000, date_paiement: null, reference: 'PAY-2026-011', moyen: null, statut: 'en_attente' as const, commentaire: null },
  { id: 12, bail_id: 4, locataire: 'Afi Koudjo', bien_reference: 'BIEN-006', periode_mois: 3, periode_annee: 2026, montant_attendu: 110000, montant_paye: 0, reste_a_payer: 110000, date_paiement: null, reference: 'PAY-2026-012', moyen: null, statut: 'en_attente' as const, commentaire: null },
  { id: 13, bail_id: 5, locataire: 'Komlan Assignon', bien_reference: 'BIEN-008', periode_mois: 1, periode_annee: 2026, montant_attendu: 320000, montant_paye: 320000, reste_a_payer: 0, date_paiement: '2026-01-03', reference: 'PAY-2026-013', moyen: 'virement' as const, statut: 'paye' as const, commentaire: null },
  { id: 14, bail_id: 5, locataire: 'Komlan Assignon', bien_reference: 'BIEN-008', periode_mois: 2, periode_annee: 2026, montant_attendu: 320000, montant_paye: 320000, reste_a_payer: 0, date_paiement: '2026-02-02', reference: 'PAY-2026-014', moyen: 'virement' as const, statut: 'paye' as const, commentaire: null },
  { id: 15, bail_id: 5, locataire: 'Komlan Assignon', bien_reference: 'BIEN-008', periode_mois: 3, periode_annee: 2026, montant_attendu: 320000, montant_paye: 320000, reste_a_payer: 0, date_paiement: '2026-03-01', reference: 'PAY-2026-015', moyen: 'virement' as const, statut: 'paye' as const, commentaire: null },
];

// ===== QUITTANCES =====
export const mockQuittances = [
  { id: 1, paiement_loyer_id: 1, numero: 'QUIT-2026-001', montant_loyer: 150000, montant_charges: 25000, montant_total: 175000, date_emission: '2026-01-06', date_envoi: '2026-01-06', envoyee: true, pdf_url: null, locataire: 'Kofi Mensah', bien_reference: 'BIEN-001', periode: 'Janvier 2026' },
  { id: 2, paiement_loyer_id: 2, numero: 'QUIT-2026-002', montant_loyer: 150000, montant_charges: 25000, montant_total: 175000, date_emission: '2026-02-04', date_envoi: null, envoyee: false, pdf_url: null, locataire: 'Kofi Mensah', bien_reference: 'BIEN-001', periode: 'Février 2026' },
  { id: 3, paiement_loyer_id: 4, numero: 'QUIT-2026-003', montant_loyer: 350000, montant_charges: 50000, montant_total: 400000, date_emission: '2026-01-03', date_envoi: '2026-01-03', envoyee: true, pdf_url: null, locataire: 'Ama Djossou', bien_reference: 'BIEN-002', periode: 'Janvier 2026' },
  { id: 4, paiement_loyer_id: 5, numero: 'QUIT-2026-004', montant_loyer: 350000, montant_charges: 50000, montant_total: 400000, date_emission: '2026-02-02', date_envoi: '2026-02-02', envoyee: true, pdf_url: null, locataire: 'Ama Djossou', bien_reference: 'BIEN-002', periode: 'Février 2026' },
  { id: 5, paiement_loyer_id: 6, numero: 'QUIT-2026-005', montant_loyer: 350000, montant_charges: 50000, montant_total: 400000, date_emission: '2026-03-02', date_envoi: null, envoyee: false, pdf_url: null, locataire: 'Ama Djossou', bien_reference: 'BIEN-002', periode: 'Mars 2026' },
  { id: 6, paiement_loyer_id: 7, numero: 'QUIT-2026-006', montant_loyer: 65000, montant_charges: 10000, montant_total: 75000, date_emission: '2026-01-09', date_envoi: '2026-01-10', envoyee: true, pdf_url: null, locataire: 'Yao Agbeko', bien_reference: 'BIEN-004', periode: 'Janvier 2026' },
  { id: 7, paiement_loyer_id: 10, numero: 'QUIT-2026-007', montant_loyer: 95000, montant_charges: 15000, montant_total: 110000, date_emission: '2026-01-05', date_envoi: '2026-01-05', envoyee: true, pdf_url: null, locataire: 'Afi Koudjo', bien_reference: 'BIEN-006', periode: 'Janvier 2026' },
  { id: 8, paiement_loyer_id: 13, numero: 'QUIT-2026-008', montant_loyer: 280000, montant_charges: 40000, montant_total: 320000, date_emission: '2026-01-04', date_envoi: '2026-01-04', envoyee: true, pdf_url: null, locataire: 'Komlan Assignon', bien_reference: 'BIEN-008', periode: 'Janvier 2026' },
  { id: 9, paiement_loyer_id: 14, numero: 'QUIT-2026-009', montant_loyer: 280000, montant_charges: 40000, montant_total: 320000, date_emission: '2026-02-03', date_envoi: '2026-02-03', envoyee: true, pdf_url: null, locataire: 'Komlan Assignon', bien_reference: 'BIEN-008', periode: 'Février 2026' },
  { id: 10, paiement_loyer_id: 15, numero: 'QUIT-2026-010', montant_loyer: 280000, montant_charges: 40000, montant_total: 320000, date_emission: '2026-03-02', date_envoi: null, envoyee: false, pdf_url: null, locataire: 'Komlan Assignon', bien_reference: 'BIEN-008', periode: 'Mars 2026' },
];

// ===== ALERTES (extended) =====
export const mockAlertesAll = [
  { id: 1, type: 'loyer_impaye' as const, message: 'Loyer impayé pour BIEN-001 — Kofi Mensah (Mars 2026)', date: '2026-03-10', bien_id: 1, bail_id: 1, lu: false },
  { id: 2, type: 'fin_bail' as const, message: 'Bail BIEN-004 expire dans 60 jours (Yao Agbeko)', date: '2026-03-05', bien_id: 4, bail_id: 3, lu: false },
  { id: 3, type: 'revision_loyer' as const, message: 'Révision annuelle du loyer pour BIEN-002 prévue le 01/03/2026', date: '2026-02-28', bien_id: 2, bail_id: 2, lu: false },
  { id: 4, type: 'loyer_impaye' as const, message: 'Loyer impayé pour BIEN-006 — Afi Koudjo (Février 2026)', date: '2026-02-15', bien_id: 6, bail_id: 4, lu: false },
  { id: 5, type: 'fin_bail' as const, message: 'Bail BIEN-001 expire dans 90 jours (Kofi Mensah)', date: '2026-01-20', bien_id: 1, bail_id: 1, lu: true },
  { id: 6, type: 'loyer_impaye' as const, message: 'Loyer impayé pour BIEN-006 — Afi Koudjo (Mars 2026)', date: '2026-03-12', bien_id: 6, bail_id: 4, lu: false },
  { id: 7, type: 'bail_cree' as const, message: 'Nouveau bail créé pour BIEN-008 — Komlan Assignon', date: '2024-03-28', bien_id: 8, bail_id: 5, lu: true },
  { id: 8, type: 'revision_loyer' as const, message: 'Révision annuelle du loyer pour BIEN-001 prévue le 01/01/2026', date: '2025-12-01', bien_id: 1, bail_id: 1, lu: true },
  { id: 9, type: 'fin_bail' as const, message: 'Bail BIEN-006 expire dans 150 jours (Afi Koudjo)', date: '2026-03-01', bien_id: 6, bail_id: 4, lu: false },
  { id: 10, type: 'loyer_impaye' as const, message: 'Paiement partiel BIEN-004 — Yao Agbeko (Février 2026), reste 25 000 FCFA', date: '2026-02-12', bien_id: 4, bail_id: 3, lu: true },
];

// ===== COMPTABILITÉ =====
export const mockComptaResumeAnnuel = {
  total_revenus: 11_090_000,
  total_depenses: 1_910_000,
  benefice_net: 9_180_000,
  taux_occupation: 78,
  nb_biens_rentables: 5,
};

export const mockComptaMensuel = [
  { mois: 'Jan', revenus: 1080000, depenses: 140000 },
  { mois: 'Fév', revenus: 1020000, depenses: 165000 },
  { mois: 'Mar', revenus: 1045000, depenses: 190000 },
  { mois: 'Avr', revenus: 820000, depenses: 145000 },
  { mois: 'Mai', revenus: 850000, depenses: 180000 },
  { mois: 'Juin', revenus: 870000, depenses: 95000 },
  { mois: 'Juil', revenus: 900000, depenses: 220000 },
  { mois: 'Août', revenus: 880000, depenses: 130000 },
  { mois: 'Sep', revenus: 920000, depenses: 160000 },
  { mois: 'Oct', revenus: 910000, depenses: 110000 },
  { mois: 'Nov', revenus: 930000, depenses: 200000 },
  { mois: 'Déc', revenus: 865000, depenses: 175000 },
];

export const mockComptaParBien = [
  { bien_reference: 'BIEN-001', adresse: '15 Rue du Commerce, Lomé', revenus: 2100000, depenses: 145000, benefice: 1955000 },
  { bien_reference: 'BIEN-002', adresse: '42 Boulevard Circulaire, Lomé', revenus: 4800000, depenses: 285000, benefice: 4515000 },
  { bien_reference: 'BIEN-004', adresse: '23 Rue des Palmiers, Sokodé', revenus: 825000, depenses: 60000, benefice: 765000 },
  { bien_reference: 'BIEN-006', adresse: '17 Rue de Calavi, Lomé', revenus: 1210000, depenses: 90000, benefice: 1120000 },
  { bien_reference: 'BIEN-008', adresse: '30 Quartier Administratif, Kara', revenus: 3840000, depenses: 210000, benefice: 3630000 },
  { bien_reference: 'BIEN-003', adresse: '8 Av. de la Libération, Kpalimé', revenus: 0, depenses: 320000, benefice: -320000 },
  { bien_reference: 'BIEN-005', adresse: '5 Marché Central, Lomé', revenus: 0, depenses: 620000, benefice: -620000 },
  { bien_reference: 'BIEN-007', adresse: '12 Av. Nouvelle Marche, Lomé', revenus: 0, depenses: 15000, benefice: -15000 },
  { bien_reference: 'BIEN-009', adresse: 'Route de Kpalimé, Tsévié', revenus: 315000, depenses: 65000, benefice: 250000 },
];
