import { Building2, LogOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatFCFA, formatDate } from '@/lib/format';

const mockBailLocataire = {
  bien_adresse: '15 Rue du Commerce, Lomé',
  loyer: 150000,
  charges: 25000,
  date_debut: '2024-01-01',
  date_fin: '2025-12-31',
  statut: 'actif',
};

const mockPaiements = [
  { id: 1, mois: 'Mars 2026', montant: 150000, date: '2026-03-05', statut: 'paye' },
  { id: 2, mois: 'Février 2026', montant: 150000, date: '2026-02-03', statut: 'paye' },
  { id: 3, mois: 'Janvier 2026', montant: 100000, date: '2026-01-10', statut: 'partiel' },
  { id: 4, mois: 'Décembre 2025', montant: 150000, date: '2025-12-05', statut: 'paye' },
  { id: 5, mois: 'Novembre 2025', montant: 0, date: null, statut: 'en_attente' },
  { id: 6, mois: 'Octobre 2025', montant: 150000, date: '2025-10-02', statut: 'paye' },
];

const mockQuittances = [
  { id: 1, periode: 'Mars 2026', date_emission: '2026-03-06' },
  { id: 2, periode: 'Février 2026', date_emission: '2026-02-04' },
  { id: 3, periode: 'Décembre 2025', date_emission: '2025-12-06' },
];

export default function MonEspacePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">LOXIS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.prenom} {user?.nom}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Mon espace locataire</h1>

        {/* Active lease */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Mon bail actif</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-sm text-muted-foreground">Adresse du bien</p><p className="font-medium">{mockBailLocataire.bien_adresse}</p></div>
              <div><p className="text-sm text-muted-foreground">Loyer mensuel</p><p className="font-medium text-primary">{formatFCFA(mockBailLocataire.loyer)}</p></div>
              <div><p className="text-sm text-muted-foreground">Charges</p><p className="font-medium">{formatFCFA(mockBailLocataire.charges)}</p></div>
              <div><p className="text-sm text-muted-foreground">Période</p><p className="font-medium">{formatDate(mockBailLocataire.date_debut)} — {formatDate(mockBailLocataire.date_fin)}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Payment history */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Historique des paiements</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPaiements.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{p.mois}</p>
                    {p.date && <p className="text-xs text-muted-foreground">Payé le {formatDate(p.date)}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatFCFA(p.montant)}</span>
                    <StatusBadge status={p.statut as any} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Receipts */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Mes quittances</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockQuittances.map(q => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Quittance — {q.periode}</p>
                    <p className="text-xs text-muted-foreground">Émise le {formatDate(q.date_emission)}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
