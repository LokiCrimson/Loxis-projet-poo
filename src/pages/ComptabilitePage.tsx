import { TrendingUp, TrendingDown, Download, Wallet, BarChart3, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useComptaResume, useComptaMensuel, useComptaParBien } from '@/hooks/use-comptabilite';
import { formatFCFA } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ComptabilitePage() {
  const { data: resume, isLoading: rLoading } = useComptaResume();
  const { data: mensuel, isLoading: mLoading } = useComptaMensuel();
  const { data: parBien, isLoading: bLoading } = useComptaParBien();
  const { toast } = useToast();

  const handleExportCSV = () => {
    if (!parBien) return;
    const headers = 'Bien,Adresse,Revenus,Dépenses,Bénéfice net\n';
    const rows = parBien.map(b => `${b.bien_reference},"${b.adresse}",${b.revenus},${b.depenses},${b.benefice}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'comptabilite-loxis.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export CSV téléchargé' });
  };

  const kpis = resume ? [
    { label: 'Revenus totaux', value: formatFCFA(resume.total_revenus), icon: TrendingUp, color: 'bg-success/10 text-success' },
    { label: 'Dépenses totales', value: formatFCFA(resume.total_depenses), icon: TrendingDown, color: 'bg-destructive/10 text-destructive' },
    { label: 'Bénéfice net', value: formatFCFA(resume.benefice_net), icon: Wallet, color: 'bg-secondary/10 text-secondary' },
    { label: 'Taux d\'occupation', value: `${resume.taux_occupation}%`, icon: Building2, color: 'bg-secondary/10 text-secondary' },
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comptabilité"
        subtitle="Synthèse financière — 2025"
        action={<Button variant="outline" onClick={handleExportCSV}><Download className="mr-2 h-4 w-4" />Exporter CSV</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} type="card" />)
        ) : kpis.map((kpi, i) => (
          <div key={i} className="rounded-xl bg-card p-5 shadow-sm">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', kpi.color)}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold">{kpi.value}</p>
            <p className="mt-1 label-uppercase">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <h3 className="section-title mb-4">Revenus vs Dépenses mensuels</h3>
        {mLoading ? <LoadingSkeleton lines={6} /> : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={mensuel}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" tickFormatter={v => `${(v / 1000)}k`} />
              <Tooltip formatter={(value: number) => formatFCFA(value)} />
              <Legend />
              <Bar dataKey="revenus" name="Revenus" fill="hsl(214, 60%, 27%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depenses" name="Dépenses" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Per property */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <h3 className="section-title mb-4">Bénéfice net par bien</h3>
        {bLoading ? <LoadingSkeleton type="table" lines={6} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-medium text-muted-foreground">Bien</th>
                  <th className="p-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Adresse</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Revenus</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Dépenses</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Bénéfice net</th>
                </tr>
              </thead>
              <tbody>
                {parBien?.map((b, idx) => (
                  <tr key={b.bien_reference} className={cn('border-b border-border hover:bg-muted/30', idx % 2 === 0 ? '' : 'bg-muted/10')}>
                    <td className="p-3 font-medium">{b.bien_reference}</td>
                    <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs max-w-[200px] truncate">{b.adresse}</td>
                    <td className="p-3 text-right text-success">{formatFCFA(b.revenus)}</td>
                    <td className="p-3 text-right text-destructive">{formatFCFA(b.depenses)}</td>
                    <td className={cn('p-3 text-right font-bold', b.benefice >= 0 ? 'text-success' : 'text-destructive')}>{formatFCFA(b.benefice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-bold">
                  <td className="p-3" colSpan={2}>Total</td>
                  <td className="p-3 text-right text-success">{formatFCFA(parBien?.reduce((s, b) => s + b.revenus, 0) || 0)}</td>
                  <td className="p-3 text-right text-destructive">{formatFCFA(parBien?.reduce((s, b) => s + b.depenses, 0) || 0)}</td>
                  <td className="p-3 text-right">{formatFCFA(parBien?.reduce((s, b) => s + b.benefice, 0) || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
