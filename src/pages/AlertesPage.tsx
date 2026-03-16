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

const alertConfig: Record<string, { border: string; icon: typeof AlertTriangle; iconColor: string; label: string }> = {
  loyer_impaye: { border: 'border-l-destructive', icon: AlertTriangle, iconColor: 'text-destructive', label: 'Loyer impayé' },
  fin_bail: { border: 'border-l-warning', icon: Clock, iconColor: 'text-warning', label: 'Fin de bail' },
  revision_loyer: { border: 'border-l-secondary', icon: RefreshCw, iconColor: 'text-secondary', label: 'Révision loyer' },
  bail_cree: { border: 'border-l-success', icon: Info, iconColor: 'text-success', label: 'Bail créé' },
};

export default function AlertesPage() {
  const [typeFilter, setTypeFilter] = useState('tous');
  const [luFilter, setLuFilter] = useState('tous');

  const params: Record<string, string> = {};
  if (typeFilter !== 'tous') params.type = typeFilter;
  if (luFilter !== 'tous') params.lu = luFilter === 'lues' ? 'true' : 'false';

  const { data: alertes, isLoading } = useAllAlertes(params);
  const marquerLueMut = useMarquerAlerteLue();
  const marquerToutesMut = useMarquerToutesLues();

  const nonLues = alertes?.filter(a => !a.lu).length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertes"
        subtitle={`${nonLues} alerte${nonLues > 1 ? 's' : ''} non lue${nonLues > 1 ? 's' : ''}`}
        action={
          nonLues > 0 ? (
            <Button variant="outline" onClick={() => marquerToutesMut.mutate()} disabled={marquerToutesMut.isPending}>
              <CheckCheck className="mr-2 h-4 w-4" />Tout marquer comme lu
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les types</SelectItem>
            <SelectItem value="loyer_impaye">Loyer impayé</SelectItem>
            <SelectItem value="fin_bail">Fin de bail</SelectItem>
            <SelectItem value="revision_loyer">Révision loyer</SelectItem>
            <SelectItem value="bail_cree">Bail créé</SelectItem>
          </SelectContent>
        </Select>
        <Select value={luFilter} onValueChange={setLuFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Toutes</SelectItem>
            <SelectItem value="non_lues">Non lues</SelectItem>
            <SelectItem value="lues">Lues</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={8} />
      ) : !alertes?.length ? (
        <EmptyState icon={Bell} title="Aucune alerte" description="Vous n'avez aucune alerte pour le moment." />
      ) : (
        <div className="space-y-3">
          {alertes.map(alerte => {
            const config = alertConfig[alerte.type] || alertConfig.bail_cree;
            return (
              <div
                key={alerte.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border-l-4 bg-card p-4 shadow-sm transition-all',
                  config.border,
                  !alerte.lu && 'ring-1 ring-secondary/20'
                )}
              >
                <div className={cn('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', `${config.iconColor.replace('text-', 'bg-')}/10`)}>
                  <config.icon className={cn('h-4 w-4', config.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-semibold rounded-full px-2 py-0.5', `${config.iconColor.replace('text-', 'bg-')}/10`, config.iconColor)}>
                      {config.label}
                    </span>
                    {!alerte.lu && <span className="h-2 w-2 rounded-full bg-secondary animate-pulse-dot" />}
                  </div>
                  <p className="mt-1 text-sm text-foreground">{alerte.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(alerte.date)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!alerte.lu && (
                    <Button variant="ghost" size="sm" onClick={() => marquerLueMut.mutate(alerte.id)} title="Marquer comme lu">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/biens/${alerte.bien_id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
