import { cn } from '@/lib/utils';

type Status = 'vacant' | 'loue' | 'en_travaux' | 'actif' | 'termine' | 'resilie' | 'paye' | 'partiel' | 'en_attente';

const statusConfig: Record<Status, { label: string; className: string }> = {
  vacant: { label: 'Vacant', className: 'bg-muted text-muted-foreground' },
  loue: { label: 'Loué', className: 'bg-success/10 text-success' },
  en_travaux: { label: 'En travaux', className: 'bg-warning/10 text-warning' },
  actif: { label: 'Actif', className: 'bg-success/10 text-success' },
  termine: { label: 'Terminé', className: 'bg-muted text-muted-foreground' },
  resilie: { label: 'Résilié', className: 'bg-destructive/10 text-destructive' },
  paye: { label: 'Payé', className: 'bg-success/10 text-success' },
  partiel: { label: 'Partiel', className: 'bg-warning/10 text-warning' },
  en_attente: { label: 'En attente', className: 'bg-warning/10 text-warning' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as Status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', config.className, className)}>
      {config.label}
    </span>
  );
}
