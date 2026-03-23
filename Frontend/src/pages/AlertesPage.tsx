import { useState } from 'react';
import { Bell, AlertTriangle, Clock, RefreshCw, CheckCheck, Eye, Check, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useAllAlertes, useMarquerAlerteLue, useMarquerToutesLues } from '@/hooks/use-alertes';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const alertConfig: Record<string, { border: string; icon: typeof AlertTriangle; iconColor: string; label: string; bgColor: string; badgeColor: string }> = {
  UNPAID_RENT: { border: 'border-l-destructive', icon: AlertTriangle, iconColor: 'text-destructive', label: 'Loyer impayé', bgColor: 'bg-destructive/10', badgeColor: 'bg-destructive/10' },
  LEASE_END: { border: 'border-l-amber-500', icon: Clock, iconColor: 'text-amber-600', label: 'Fin de bail', bgColor: 'bg-amber-100', badgeColor: 'bg-amber-100' },
  RENT_REVISION: { border: 'border-l-indigo-500', icon: RefreshCw, iconColor: 'text-indigo-600', label: 'Révision loyer', bgColor: 'bg-indigo-100', badgeColor: 'bg-indigo-100' },
  LEASE_CREATED: { border: 'border-l-emerald-500', icon: Info, iconColor: 'text-emerald-600', label: 'Bail créé', bgColor: 'bg-emerald-100', badgeColor: 'bg-emerald-100' },
  PROPERTY_VACANT: { border: 'border-l-slate-400', icon: Bell, iconColor: 'text-slate-500', label: 'Bien vacant', bgColor: 'bg-slate-100', badgeColor: 'bg-slate-100' },
};

export default function AlertesPage() {
  const [typeFilter, setTypeFilter] = useState('tous');
  const [luFilter, setLuFilter] = useState('tous');

  const params: Record<string, string> = {
    // Le backend attend 'alert_type' ou 'type' (vu dans apis.py)
    // Et 'lu' pour le filtrage par statut
  };
  if (typeFilter !== 'tous') params.alert_type = typeFilter;
  if (luFilter === 'non_lues') params.lu = 'false';
  if (luFilter === 'lues') params.lu = 'true';

  const { data: alertes, isLoading, refetch } = useAllAlertes(params);
  const marquerLueMut = useMarquerAlerteLue();
  const marquerToutesMut = useMarquerToutesLues();

  const handleMarquerLue = async (id: number) => {
    await marquerLueMut.mutateAsync(id);
    refetch(); // Forcer le rafraîchissement au cas où
  };

  const handleMarquerToutesLues = async () => {
    await marquerToutesMut.mutateAsync();
    refetch();
  };

  const nonLues = (Array.isArray(alertes) ? alertes : []).filter(a => !a.is_read).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="flex flex-col gap-2">
           <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-4">
              Alertes
              {nonLues > 0 && (
                <span className="inline-flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-black min-w-[24px] h-6 px-1.5 rounded-full shadow-lg shadow-destructive/20 animate-in zoom-in duration-300">
                  {nonLues}
                </span>
              )}
           </h1>
           <p className="text-muted-foreground font-medium italic">Gestion des événements critiques du patrimoine.</p>
        </div>
        
        {nonLues > 0 && (
          <Button 
            className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 h-12 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
            onClick={handleMarquerToutesLues} 
            disabled={marquerToutesMut.isPending}
          >
            <CheckCheck className="h-5 w-5" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl border border-border shadow-inner">
           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filtrage</span>
           <Select value={typeFilter} onValueChange={setTypeFilter}>
             <SelectTrigger className="w-48 bg-transparent border-none focus:ring-0 font-bold text-foreground">
               <SelectValue placeholder="Type d'alerte" />
             </SelectTrigger>
             <SelectContent className="rounded-2xl shadow-2xl border-border bg-card">
               <SelectItem value="tous">Tous les types</SelectItem>
               <SelectItem value="UNPAID_RENT">Loyer impayé</SelectItem>
               <SelectItem value="LEASE_END">Fin de bail</SelectItem>
               <SelectItem value="RENT_REVISION">Révision loyer</SelectItem>
               <SelectItem value="LEASE_CREATED">Bail créé</SelectItem>
               <SelectItem value="PROPERTY_VACANT">Bien vacant</SelectItem>
             </SelectContent>
           </Select>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl border border-border shadow-inner">
           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</span>
           <Select value={luFilter} onValueChange={setLuFilter}>
             <SelectTrigger className="w-40 bg-transparent border-none focus:ring-0 font-bold text-foreground">
               <SelectValue placeholder="Lecture" />
             </SelectTrigger>
             <SelectContent className="rounded-2xl shadow-2xl border-border bg-card">
               <SelectItem value="tous">Toutes</SelectItem>
               <SelectItem value="non_lues">Non lues</SelectItem>
               <SelectItem value="lues">Lues</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={8} />
      ) : !Array.isArray(alertes) || alertes.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune alerte" description="Vous n'avez aucune alerte pour le moment." />
      ) : (
        <div className="space-y-3">
          {alertes.map(alerte => {
            const config = alertConfig[alerte.alert_type as keyof typeof alertConfig] || { 
              border: 'border-l-slate-200', 
              icon: Bell, 
              iconColor: 'text-slate-400', 
              label: 'Notification',
              bgColor: 'bg-slate-50',
              badgeColor: 'bg-slate-100'
            };
            return (
              <div
                key={alerte.id}
                className={cn(
                  'flex items-start gap-4 rounded-xl border-l-[6px] bg-card p-5 shadow-sm transition-all hover:shadow-md border border-border',
                  config.border,
                  !alerte.is_read ? 'bg-primary/5 ring-1 ring-primary/10' : 'opacity-80'
                )}
              >
                <div className={cn('mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl', config.bgColor)}>
                  <config.icon className={cn('h-5 w-5', config.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={cn('text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-0.5', config.badgeColor, config.iconColor)}>
                      {config.label}
                    </span>
                    {!alerte.is_read && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary text-[9px] font-black text-primary-foreground uppercase tracking-tighter animate-pulse">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1.5 font-bold text-foreground leading-tight">{alerte.title || config.label}</h4>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed italic">{alerte.message}</p>
                  <p className="mt-2 text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(alerte.timestamp)}
                  </p>
                </div>
                <div className="flex gap-1.5 self-center">
                  {!alerte.is_read && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full text-indigo-500 hover:bg-indigo-50"
                      onClick={() => handleMarquerLue(alerte.id)}
                      title="Marquer comme lu"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {alerte.entity_name === 'Expense' && alerte.entity_id && (
                    <Link to={`/biens`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-400">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
