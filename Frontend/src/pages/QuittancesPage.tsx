import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Receipt, Mail, FileText, Check, Download, Printer, User, Building2, Calendar, ShieldCheck, ChevronRight, X, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useQuittances, useEnvoyerQuittance, useDownloadQuittance, useExportQuittances } from '@/hooks/use-quittances';
import { formatFCFA, formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function QuittancesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role === 'TENANT') {
      navigate('/mes-paiements');
    }
  }, [user, navigate]);

  if (user?.role === 'TENANT') return null;

  const params: Record<string, string> = {};
  if (search) params.search = search;

  const { data: quittances, isLoading } = useQuittances(params);
  const envoyerMut = useEnvoyerQuittance();
  const downloadMut = useDownloadQuittance();
  const exportMut = useExportQuittances();

  const previewQuittance = quittances?.find(q => q.id === previewId);

  const handleEnvoyer = (id: number) => {
    envoyerMut.mutate(id, {
      onSuccess: () => toast({ title: t('receipt_sent'), description: t('receipt_sent_desc') }),
    });
  };

  const handleDownload = (id: number, numero: string) => {
    downloadMut.mutate(id, {
      onSuccess: (data: any) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Quittance_${numero}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast({ title: t('download_success'), description: t('doc_ready') });
      },
      onError: () => toast({ variant: 'destructive', title: t('error'), description: 'Impossible de générer le PDF.' })
    });
  };

  const handleExport = () => {
    exportMut.mutate(undefined, {
      onSuccess: (data: any) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Reporting_Comptable_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast({ title: t('export_success'), description: "Le fichier Excel a été généré avec succès." });
      },
      onError: () => toast({ variant: 'destructive', title: t('error'), description: "L'export a échoué." })
    });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-100 group overflow-hidden transition-transform hover:scale-105 duration-500">
            <Receipt className="h-7 w-7 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('receipt_registry')}</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{t('auto_receipt_gen')}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button 
             onClick={handleExport}
             disabled={exportMut.isPending}
             variant="outline" className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-sm font-black h-12 px-6 flex gap-2 text-slate-900 dark:text-white hover:shadow-md transition-all"
           >
             {exportMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5 text-indigo-500" />} {t('export_all')}
           </Button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-sm flex flex-wrap items-center gap-4 mx-2">
        <div className="flex-1 min-w-[300px] relative transition-all focus-within:ring-2 focus-within:ring-indigo-500/10 rounded-2xl">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input 
             placeholder={t('receipt_search_placeholder')} 
             className="w-full pl-11 h-[3.5rem] rounded-2xl border-none bg-slate-50 dark:bg-slate-800/50 font-bold placeholder:text-slate-400 focus-visible:ring-0"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
           <ShieldCheck className="h-5 w-5 text-indigo-500" />
           <span className="text-xs font-black uppercase tracking-widest text-slate-500">
             {quittances?.length || 0} Validées
           </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="px-2">
        <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 p-2">
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSkeleton type="table" lines={10} />
            ) : !quittances?.length ? (
              <EmptyState icon={Receipt} title="Aucune quittance" description="Les quittances seront générées dès qu'un encaissement est validé." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence & Émetteur</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Locataire / Destination</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Période Concernée</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Montant Total</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">État d'envoi</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {quittances.map((q) => (
                      <tr key={q.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0 group-hover:rotate-3 transition-transform duration-500">
                                 <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                 <div className="font-black text-slate-900 dark:text-white uppercase tracking-tighter shadow-indigo-100">{q.numero}</div>
                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 italic flex items-center gap-1">
                                   <Calendar className="h-3 w-3" /> {formatDate(q.date_emission)}
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-col">
                              <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                 <User className="h-3.5 w-3.5 text-slate-300" /> {q.locataire_nom}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center mt-1 truncate max-w-[180px]">
                                 <Building2 className="h-3 w-3 mr-1 shrink-0" /> {q.bien_reference}
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <span className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight">{q.periode}</span>
                        </td>
                        <td className="p-6 text-right">
                           <div className="inline-flex flex-col items-end">
                              <span className="text-md font-black text-emerald-600 whitespace-nowrap">{formatFCFA(q.montant_total)}</span>
                              <span className="text-[9px] font-black text-slate-300 uppercase italic">Toutes charges comprises</span>
                           </div>
                        </td>
                        <td className="p-6 text-center">
                           {q.envoyee ? (
                              <Badge className="bg-emerald-100 text-emerald-600 rounded-full px-4 py-1 font-black text-[10px] uppercase shadow-sm border-none">
                                 Envoyée
                              </Badge>
                           ) : (
                              <Badge className="bg-slate-100 text-slate-400 rounded-full px-4 py-1 font-black text-[10px] uppercase border-none">
                                 En attente
                              </Badge>
                           )}
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex justify-end gap-2">
                             <Button 
                               variant="outline" 
                               size="icon" 
                               onClick={() => setPreviewId(q.id)}
                               className="h-10 w-10 rounded-xl border-none bg-slate-50 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                             <Button 
                               variant="outline" 
                               size="icon" 
                               onClick={() => handleEnvoyer(q.id)} 
                               disabled={envoyerMut.isPending}
                               className={cn(
                                 "h-10 w-10 rounded-xl border-none shadow-sm transition-all",
                                 q.envoyee ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 hover:bg-indigo-600 hover:text-white"
                               )}
                             >
                               {envoyerMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                             </Button>
                           </div>
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

      {/* PDF Preview Modal */}
      <Dialog open={!!previewId} onOpenChange={() => setPreviewId(null)}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                <Receipt className="h-40 w-40" />
             </div>
             <DialogHeader className="relative z-10 text-left">
               <DialogTitle className="text-4xl font-black tracking-tighter">Aperçu Analytique</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
                 <ShieldCheck className="h-3 w-3 text-emerald-500" /> Document Certifié Loxis • N° {previewQuittance?.numero}
               </DialogDescription>
             </DialogHeader>
          </div>

          {previewQuittance && (
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-12">
                 <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">DESTINATAIRE</h5>
                    <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                       <p className="font-black text-slate-900 dark:text-white mb-1">{previewQuittance.locataire_nom}</p>
                       <p className="text-xs font-bold text-slate-400 italic leading-relaxed">{previewQuittance.bien_adresse}</p>
                    </div>
                 </div>
                 <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">PÉRIODE DE LOYER</h5>
                    <div className="p-5 rounded-[1.5rem] bg-indigo-50 border border-indigo-100">
                       <p className="font-black text-indigo-700 text-lg uppercase tracking-tight">{previewQuittance.periode}</p>
                       <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Échéance acquittée</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">DÉCOMPTE FINANCIER</h5>
                 <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-5 flex justify-between items-center bg-white dark:bg-slate-900">
                       <span className="text-sm font-bold text-slate-500">Loyer Principal</span>
                       <span className="font-black text-slate-900 dark:text-white">{formatFCFA(previewQuittance.montant_loyer)}</span>
                    </div>
                    <div className="p-5 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                       <span className="text-sm font-bold text-slate-500">Charges récupérables</span>
                       <span className="font-black text-slate-900 dark:text-white">{formatFCFA(previewQuittance.montant_charges)}</span>
                    </div>
                    <div className="p-6 flex justify-between items-center bg-indigo-600 text-white">
                       <span className="font-black uppercase tracking-widest text-xs opacity-80">NET À PAYER</span>
                       <span className="text-2xl font-black">{formatFCFA(previewQuittance.montant_total)}</span>
                    </div>
                 </div>
              </div>

              <div className="pt-4 flex gap-4">
                 <Button 
                   onClick={() => previewQuittance && handleDownload(previewQuittance.id, previewQuittance.numero)}
                   disabled={downloadMut.isPending}
                   className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest gap-2"
                 >
                    {downloadMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Télécharger
                 </Button>
                 <Button 
                   onClick={() => window.print()}
                   variant="outline" className="flex-1 h-14 rounded-2xl border-2 border-slate-900 font-black text-xs uppercase tracking-widest gap-2 hover:bg-slate-50"
                 >
                    <Printer className="h-4 w-4" /> Imprimer
                 </Button>
                 <Button onClick={() => setPreviewId(null)} variant="ghost" className="h-14 w-14 rounded-2xl text-slate-300 hover:text-slate-900">
                    <X className="h-6 w-6" />
                 </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
