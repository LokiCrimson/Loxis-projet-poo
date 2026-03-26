import { useState } from 'react';
import { CreditCard, Plus, Calendar, Filter, User, Building2, Wallet, ArrowRight, CheckCircle2, AlertCircle, Clock, Search, Download, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { usePaiements, useEnregistrerPaiement, useExportPaiements } from '@/hooks/use-paiements';
import { formatFCFA } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const moisLabels = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function PaiementsPage() {
  const [search, setSearch] = useState('');
  const [mois, setMois] = useState('all');
  const [statut, setStatut] = useState('tous');
  const [payModal, setPayModal] = useState<any | null>(null);
  const [montantPaye, setMontantPaye] = useState('');
  const [moyen, setMoyen] = useState('virement');
  const [reference, setReference] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const params: Record<string, string> = {
    annee: currentYear.toString()
  };
  if (mois && mois !== 'all') params.mois = mois;
  if (statut !== 'tous') params.statut = statut;
  if (search.trim()) params.search = search.trim();

  const { data: paiements, isLoading } = usePaiements(params);
  const enregistrerMut = useEnregistrerPaiement();
  const exportMut = useExportPaiements();

  const filteredPaiements = (paiements || []).filter(p => {
    const searchLower = search.toLowerCase();
    return (
      p.locataire?.toLowerCase().includes(searchLower) ||
      p.locataire_nom?.toLowerCase().includes(searchLower) ||
      p.bien_reference?.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenPayModal = (paiement: any) => {
    setPayModal(paiement);
    const attendu = Number(paiement.montant_attendu || 0);
    const dejaPaye = Number(paiement.montant_paye || 0);
    const reste = Math.max(0, attendu - dejaPaye);
    setMontantPaye(reste.toString());
  };

  const handleExport = () => {
    exportMut.mutate(undefined, {
      onSuccess: (data: any) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Export_Paiements_${new Date().getFullYear()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast({ title: 'Succès', description: 'Le fichier CSV a été téléchargé.' });
      },
      onError: () => {
        toast({ title: 'Erreur', description: "L'export a échoué.", variant: 'destructive' });
      }
    });
  };

  const handleEnregistrer = () => {
    if (!payModal || !montantPaye) return;
    const nouveauCumul = Number(payModal.montant_paye || 0) + Number(montantPaye);
    const payload = {
      montant_paye: nouveauCumul,
      moyen,
      reference,
      commentaire,
      date_paiement: new Date().toISOString().split('T')[0],
      periode_mois: payModal.periode_mois,
      periode_annee: payModal.periode_annee,
      bail: payModal.bail
    };

    enregistrerMut.mutate(
      { id: payModal.id, data: payload },
      {
        onSuccess: () => {
          toast({ title: 'Succès', description: 'Paiement enregistré et quittance générée.' });
          setPayModal(null);
          setMontantPaye('');
          setReference('');
          setCommentaire('');
        },
        onError: (error: any) => {
          const detail = error.response?.data?.detail || error.response?.data?.message || "Erreur lors de l'enregistrement";
          toast({ title: 'Erreur', description: detail, variant: 'destructive' });
        }
      }
    );
  };

  const totalAttendu = paiements?.reduce((acc, p) => acc + Number(p.montant_attendu || 0), 0) || 0;
  const totalPercu = paiements?.reduce((acc, p) => acc + Number(p.montant_paye || 0), 0) || 0;
  const resteAPercevoir = totalAttendu - totalPercu;

  const stats = [
    { label: 'Total Attendu', value: formatFCFA(totalAttendu), icon: Calendar, color: 'text-slate-900', bg: 'bg-slate-50' },
    { label: 'Déjà Perçu', value: formatFCFA(totalPercu), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Reste à Percevoir', value: formatFCFA(resteAPercevoir), icon: Wallet, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-200 group overflow-hidden transition-transform hover:scale-105 duration-500">
            <CreditCard className="h-7 w-7 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Registre des Paiements</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Exercice {currentYear} • Suivi des encaissements</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button 
             onClick={handleExport}
             disabled={exportMut.isPending}
             variant="outline" className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm font-black h-12 px-6 flex gap-2 text-slate-900 dark:text-white"
           >
             {exportMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5 text-indigo-500" />} Exporter
           </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden group">
            <CardContent className="p-7">
               <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
                     <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none bg-slate-50 dark:bg-slate-800 text-slate-500">
                    Saison {currentYear}
                  </Badge>
               </div>
               <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</h3>
                  <p className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-sm flex flex-wrap items-center gap-4 mx-2">
        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[200px]">
           <Calendar className="h-4 w-4 text-indigo-500" />
           <Select value={mois} onValueChange={setMois}>
             <SelectTrigger className="bg-transparent border-none focus:ring-0 font-black text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest p-0 h-auto">
               <SelectValue placeholder="Période" />
             </SelectTrigger>
             <SelectContent className="rounded-[1.5rem] shadow-2xl border-none">
               <SelectItem value="all" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">Toute l'année</SelectItem>
               {Array.from({ length: 12 }, (_, i) => (
                 <SelectItem key={i + 1} value={(i + 1).toString()} className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">{moisLabels[i + 1]}</SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>

        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[180px]">
           <Filter className="h-4 w-4 text-indigo-500" />
           <Select value={statut} onValueChange={setStatut}>
             <SelectTrigger className="bg-transparent border-none focus:ring-0 font-black text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest p-0 h-auto">
               <SelectValue placeholder="Statut" />
             </SelectTrigger>
             <SelectContent className="rounded-[1.5rem] shadow-2xl border-none">
               <SelectItem value="tous" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">Tous statuts</SelectItem>
               <SelectItem value="paye" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">Payé</SelectItem>
               <SelectItem value="partiel" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">Partiel</SelectItem>
               <SelectItem value="en_attente" className="rounded-xl font-bold py-3 text-xs uppercase tracking-widest">En attente</SelectItem>
             </SelectContent>
           </Select>
        </div>

        <div className="flex-1 min-w-[300px] relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input 
             placeholder="Rechercher un locataire ou un bien..." 
             className="w-full pl-11 h-[3.2rem] rounded-2xl border-none bg-slate-50 dark:bg-slate-800/50 font-bold placeholder:text-slate-400 focus-visible:ring-indigo-500/20"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
      </div>

      {/* Main Table */}
      <div className="px-2">
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 p-2">
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSkeleton type="table" lines={10} />
            ) : !filteredPaiements?.length ? (
              <EmptyState icon={CreditCard} title="Aucun encaissement" description="Les flux financiers apparaîtront dès le premier loyer." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Locataire & Bien</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Période</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Attendu</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Perçu</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPaiements.map((p) => (
                      <tr key={p.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm shrink-0 group-hover:rotate-3 transition-transform">
                                 <User className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                 <div className="font-black text-slate-900 dark:text-white truncate">{p.locataire || 'Locataire Inconnu'}</div>
                                 <div className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Building2 className="h-3 w-3" /> {p.bien_reference || 'Non spécifié'}
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-700 dark:text-slate-300">{moisLabels[p.periode_mois]} {p.periode_annee}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase italic">Loyer Mensuel</span>
                           </div>
                        </td>
                        <td className="p-6 text-right font-black text-slate-400 text-sm whitespace-nowrap">{formatFCFA(p.montant_attendu)}</td>
                        <td className="p-6 text-right">
                           <div className="inline-flex flex-col items-end">
                              <span className="text-md font-black text-indigo-600 whitespace-nowrap">{formatFCFA(p.montant_paye || 0)}</span>
                              <span className="text-[9px] font-black text-slate-300 uppercase italic">Somme Validée</span>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex justify-center">
                              <Badge className={cn(
                                "rounded-full px-4 py-1.5 font-black text-[10px] uppercase tracking-tighter border-none shadow-sm",
                                p.statut === 'paye' ? 'bg-emerald-100 text-emerald-600' :
                                p.statut === 'partiel' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                              )}>
                                {p.statut === 'paye' ? 'Réglé' : p.statut === 'partiel' ? 'Partiel' : 'Impayé'}
                              </Badge>
                           </div>
                        </td>
                        <td className="p-6 text-right">
                           {p.statut !== 'paye' ? (
                             <Button 
                               onClick={() => handleOpenPayModal(p)} 
                               className="rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black px-6 h-11 shadow-lg shadow-slate-200 gap-2 transition-all duration-300"
                             >
                               <Plus className="h-4 w-4" /> Encaisser
                             </Button>
                           ) : (
                             <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest">
                                <CheckCircle2 className="h-4 w-4" /> Quittancé
                             </div>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <Dialog open={!!payModal} onOpenChange={() => setPayModal(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
          <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <Wallet className="h-32 w-32" />
             </div>
             <DialogHeader className="relative z-10">
               <DialogTitle className="text-3xl font-black tracking-tighter">Encaisser un loyer</DialogTitle>
               <DialogDescription className="text-indigo-100 font-bold opacity-80 mt-1 uppercase text-xs tracking-widest">
                 {payModal?.locataire} • {moisLabels[payModal?.periode_mois]} {payModal?.periode_annee}
               </DialogDescription>
             </DialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Montant à encaisser (FCFA)</Label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">CFA</div>
                   <Input 
                      type="number" 
                      value={montantPaye} 
                      onChange={(e) => setMontantPaye(e.target.value)}
                      className="h-14 pl-14 rounded-2xl border-none bg-slate-50 font-black text-xl text-slate-900 focus-visible:ring-indigo-500/20"
                   />
                </div>
                <div className="flex justify-between px-1">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reste dû : {formatFCFA(Number(payModal?.montant_attendu || 0) - Number(payModal?.montant_paye || 0))}</span>
                   <Button variant="link" className="h-auto p-0 text-[10px] font-black text-indigo-500 uppercase tracking-widest" onClick={() => setMontantPaye((Number(payModal?.montant_attendu || 0) - Number(payModal?.montant_paye || 0)).toString())}>Payer tout</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Mode</Label>
                   <Select value={moyen} onValueChange={setMoyen}>
                     <SelectTrigger className="h-14 rounded-2xl border-none bg-slate-50 font-bold">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-2xl">
                       <SelectItem value="virement">Virement</SelectItem>
                       <SelectItem value="especes">Espèces</SelectItem>
                       <SelectItem value="mobile_money">Mobile Money</SelectItem>
                       <SelectItem value="cheque">Chèque</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Référence</Label>
                   <Input 
                      placeholder="N° Transaction" 
                      className="h-14 rounded-2xl border-none bg-slate-50 font-bold"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                   />
                 </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Commentaire interne</Label>
                <Input 
                   placeholder="Ex: Payé en avance..." 
                   className="h-14 rounded-2xl border-none bg-slate-50 font-bold"
                   value={commentaire}
                   onChange={(e) => setCommentaire(e.target.value)}
                />
              </div>
            </div>

            <Button 
               className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
               onClick={handleEnregistrer}
               disabled={enregistrerMut.isPending || !montantPaye}
            >
               {enregistrerMut.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirmer l'Encaissement"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
