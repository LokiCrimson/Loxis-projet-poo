import { Building2, LogOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatFCFA, formatDate } from '@/lib/format';
import { useBaux } from '@/hooks/use-baux';
import { usePaiements } from '@/hooks/use-paiements';
import { useQuittances } from '@/hooks/use-quittances';

export default function MonEspacePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const { data: bauxData = [] } = useBaux({ locataire_id: user?.id?.toString() });
  const activeBail = bauxData.find((b: any) => b.statut === 'actif');

  const { data: paiementsData = [] } = usePaiements({ locataire_id: user?.id?.toString() });
  const { data: quittancesData = [] } = useQuittances({ locataire_id: user?.id?.toString() });

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
            {activeBail ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-sm text-muted-foreground">Adresse du bien</p><p className="font-medium">{activeBail.bien_adresse}</p></div>
                <div><p className="text-sm text-muted-foreground">Loyer mensuel</p><p className="font-medium text-primary">{formatFCFA(activeBail.loyer_hc || activeBail.loyer)}</p></div>
                <div><p className="text-sm text-muted-foreground">Charges</p><p className="font-medium">{formatFCFA(activeBail.charges)}</p></div>
                <div><p className="text-sm text-muted-foreground">Période</p><p className="font-medium">{formatDate(activeBail.date_debut)} — {formatDate(activeBail.date_fin)}</p></div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun bail actif trouvé.</p>
            )}
          </CardContent>
        </Card>

        {/* Payment history */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Historique des paiements</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paiementsData.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{p.mois || `${p.periode_mois}/${p.periode_annee}`}</p>
                    {p.date && <p className="text-xs text-muted-foreground">Payé le {formatDate(p.date)}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatFCFA(p.montant || p.montant_paye)}</span>
                    <StatusBadge status={p.statut as any} />
                  </div>
                </div>
              ))}
              {paiementsData.length === 0 && <p className="text-sm text-muted-foreground">Aucun paiement trouvé.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Receipts */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Mes quittances</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quittancesData.map((q: any) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Quittance — {q.periode || `${q.periode_mois}/${q.periode_annee}`}</p>
                    <p className="text-xs text-muted-foreground">Émise le {formatDate(q.date_emission || q.date_creation)}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Télécharger
                  </Button>
                </div>
              ))}
              {quittancesData.length === 0 && <p className="text-sm text-muted-foreground">Aucune quittance trouvée.</p>}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
