import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { useLocataire } from '@/hooks/use-locataires';
import { formatFCFA, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function LocataireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: loc, isLoading } = useLocataire(Number(id));

  if (isLoading) return <div className="space-y-4"><LoadingSkeleton lines={2} /><LoadingSkeleton type="card" /></div>;
  if (!loc) return <EmptyState title="Locataire non trouvÃ©" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/locataires" className="flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-4 w-4" />Locataires</Link>
        <span>/</span><span className="text-foreground">{(loc.first_name || loc.prenom)} {(loc.last_name || loc.nom)}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-xl font-bold text-secondary">
          {(loc.first_name || loc.prenom)?.[0] || 'U'}{(loc.last_name || loc.nom)?.[0] || ''}
        </div>
        <div>
          <h1 className="page-title">{(loc.first_name || loc.prenom)} {(loc.last_name || loc.nom)}</h1>
          <p className="text-sm text-muted-foreground">{loc.profession}</p>
        </div>
        <span className={cn('ml-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', (loc.is_active ?? loc.actif) ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
          {(loc.is_active ?? loc.actif) ? 'Actif' : 'Inactif'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h3 className="section-title mb-4">Informations personnelles</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><span>{loc.email}</span></div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><span>{(loc.phone || loc.telephone)}</span></div>
            {(loc.birth_date || loc.date_naissance) && <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{formatDate((loc.birth_date || loc.date_naissance))}</span></div>}
            <div className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-muted-foreground" /><span>{loc.profession}</span></div>
            <div className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-muted-foreground" /><span className="uppercase text-xs">{(loc.id_type || loc.piece_identite_type)}</span> â€” {(loc.id_number || loc.piece_identite_numero)}</div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 shadow-sm">
          <h3 className="section-title mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-secondary" />Garant</h3>
          {loc.garant ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Nom</span><span className="font-medium">{loc.garant.prenom} {loc.garant.nom}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">TÃ©lÃ©phone</span><span>{loc.garant.telephone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{loc.garant.email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Profession</span><span>{loc.garant.profession}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Revenu mensuel</span><span className="font-semibold text-secondary">{formatFCFA(loc.garant.revenu_mensuel)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">EntitÃ©</span><span>{loc.garant.entite}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Lien</span><span>{loc.garant.details}</span></div>
            </div>
          ) : (
            <EmptyState title="Pas de garant" description="Aucun garant enregistrÃ© pour ce locataire." />
          )}
        </div>
      </div>
    </div>
  );
}
