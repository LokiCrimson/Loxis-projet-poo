import { useParams, useNavigate } from "react-router-dom";
import { useLocataires } from "@/hooks/use-locataires";
import { Button } from "@/components/ui/button";
import { 
  User, Phone, Mail, Briefcase, Calendar, 
  CreditCard, Shield, ArrowLeft, Edit, Trash2, 
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { LocataireFormModal } from "@/components/LocataireFormModal";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA } from "@/lib/format";

export default function LocataireDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: locataires } = useLocataires();
  const loc = locataires?.find((l: any) => l.id === Number(id));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!loc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-slate-100 rounded-full animate-pulse">
           <User size={48} className="text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">Chargement du profil...</p>
      </div>
    );
  }

  const first_name = loc.first_name || loc.prenom || "N/A";
  const last_name = loc.last_name || loc.nom || "";
  const full_name = `${first_name} ${last_name}`;
  const phone = loc.phone || loc.telephone || "Non renseigné";
  const email = loc.email || "Non renseigné";
  const profession = loc.profession || "Non renseigné";
  const id_type = loc.id_type || loc.piece_identite_type || "CNI";
  const id_number = loc.id_number || loc.piece_identite_numero || "---";
  const birth_date = loc.birth_date || loc.date_naissance ? new Date(loc.birth_date || loc.date_naissance).toLocaleDateString('fr-FR') : "---";
  
  const garant = loc.guarantors?.[0] || loc.garant || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader
            title={full_name}
            subtitle={`Locataire ID: #${loc.id}`}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Modifier
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> {email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium flex items-center gap-2"><Phone className="h-4 w-4" /> {phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profession</p>
                <p className="font-medium flex items-center gap-2"><Briefcase className="h-4 w-4" /> {profession}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de naissance</p>
                <p className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> {birth_date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pièce d'identité</p>
                <p className="font-medium flex items-center gap-2"><CreditCard className="h-4 w-4" /> {id_type} - {id_number}</p>
              </div>
            </div>
          </div>

          {garant && (
            <div className="rounded-xl bg-card p-6 shadow-sm border-l-4 border-secondary">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-secondary" /> Garant : {garant.first_name || garant.prenom} {garant.last_name || garant.nom}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{garant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{garant.phone || garant.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profession</p>
                  <p className="font-medium">{garant.profession}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenu mensuel</p>
                  <p className="font-medium text-success">{formatFCFA(garant.monthly_income || garant.revenu_mensuel || 0)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Statut du dossier</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">État</span>
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', (loc.is_active ?? loc.actif) ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                  {(loc.is_active ?? loc.actif) ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Baux en cours</span>
                <span className="font-bold">{loc.leases?.filter((l: any) => l.statut === 'actif').length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LocataireFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        locataire={loc} 
      />
    </div>
  );
}
