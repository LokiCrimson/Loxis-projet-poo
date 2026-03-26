import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, MapPin, Maximize2, DoorOpen, 
  ArrowLeft, Star, Calendar, Bookmark, Info, 
  CheckCircle2, ShieldCheck, Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { formatFCFA } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReservation, useReservations } from '@/hooks/use-reservations';
import { format } from 'date-fns';

export default function PublicBienDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bienId = Number(id);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  const { data: bien, isLoading } = useQuery({
    queryKey: ['bien', 'public', bienId],
    queryFn: () => api.get(`/immobilier/biens/${bienId}/`).then(res => res.data),
    enabled: !!bienId,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['photos', bienId],
    queryFn: () => api.get(`/immobilier/biens/${bienId}/photos/`).then(res => res.data),
    enabled: !!bienId,
  });

  const { data: myReservations } = useReservations();
  const createMutation = useCreateReservation();

  const getReservationStatus = (id: number) => {
    return myReservations?.find(r => r.property === id)?.status;
  };

  const status = bienId ? getReservationStatus(bienId) : null;

  const handleReserve = () => {
    if (bien) {
      createMutation.mutate({ 
          property: bien.id, 
          message,
          proposed_start_date: format(new Date(), 'yyyy-MM-dd'),
          proposed_end_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd')
      }, {
        onSuccess: () => {
          setIsReserveModalOpen(false);
          setMessage('');
          navigate('/mes-demandes');
        }
      });
    }
  };

  if (isLoading) return <div className="p-8 space-y-4"><LoadingSkeleton lines={2} /><LoadingSkeleton type="card" /></div>;
  if (!bien) return <EmptyState title="Bien non trouvé" description="Ce bien n'est plus disponible ou n'existe pas." />;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        <Link to="/reserver" className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Explorer les biens
        </Link>
        <span className="opacity-30">/</span>
        <span className="text-slate-900">{bien.reference}</span>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {bien.reference}
            </h1>
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase tracking-widest text-[10px] font-black px-3 py-1">
              Disponible
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <MapPin className="h-3.5 w-3.5 text-indigo-500" />
            {bien.city}, {bien.zip_code}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {status ? (
             <Button disabled className="rounded-2xl h-12 px-6 font-black bg-slate-100 text-slate-400">
                Demande {status === 'PENDING' ? 'en attente' : status.toLowerCase()}
             </Button>
          ) : (
            <Button 
              onClick={() => setIsReserveModalOpen(true)}
              className="rounded-2xl shadow-lg shadow-indigo-500/20 h-12 px-8 font-black flex gap-2 bg-slate-900 text-white hover:scale-105 transition-all"
            >
              <Bookmark className="h-4 w-4" /> Réserver ce bien
            </Button>
          )}
        </div>
      </div>

      {/* Hero Visual Section */}
      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white relative">
        {photos && photos.length > 0 ? (
          <Carousel 
            className="w-full"
            plugins={[Autoplay({ delay: 5000 })]}
            opts={{ loop: true }}
          >
            <CarouselContent>
              {photos.map((p: any) => (
                <CarouselItem key={p.id}>
                  <div className="relative h-[450px] w-full overflow-hidden">
                    <img src={p.image} alt="Photo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                <CarouselPrevious className="relative left-0 bg-white/20 hover:bg-white border-none text-white hover:text-slate-900 h-12 w-12 rounded-2xl" />
                <CarouselNext className="relative right-0 bg-white/20 hover:bg-white border-none text-white hover:text-slate-900 h-12 w-12 rounded-2xl" />
              </div>
            )}
          </Carousel>
        ) : (
          <div className="h-[400px] w-full bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-300">
            <Building2 className="h-20 w-20 opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-widest">Aucune photo disponible</span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
            <h3 className="text-xl font-black tracking-tight text-slate-900 mb-6 uppercase tracking-widest text-[11px] opacity-40">Description</h3>
            <p className="text-slate-600 leading-relaxed italic font-medium">
              {bien.description || "Pas de description détaillée disponible pour ce bien."}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 p-6 rounded-3xl bg-slate-50 border border-slate-100">
               <div className="text-center group">
                  <div className="flex flex-col items-center gap-2">
                    <Maximize2 className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Surface</span>
                    <span className="text-sm font-black text-slate-900">{Math.round(bien.surface_area)} m²</span>
                  </div>
               </div>
               <div className="text-center group">
                  <div className="flex flex-col items-center gap-2">
                    <DoorOpen className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Pièces</span>
                    <span className="text-sm font-black text-slate-900">{bien.rooms_count}</span>
                  </div>
               </div>
               <div className="text-center group">
                  <div className="flex flex-col items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform fill-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Note</span>
                    <span className="text-sm font-black text-slate-900">{bien.average_rating || '0.0'}</span>
                  </div>
               </div>
               <div className="text-center group">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Garantie</span>
                    <span className="text-sm font-black text-slate-900">Vérifiée</span>
                  </div>
               </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-indigo-600 text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap className="h-40 w-40" />
            </div>
            <h3 className="text-xl font-black tracking-tight mb-8 relative z-10 italic">Offre de Location</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Loyer Mensuel</span>
                <span className="text-2xl font-black">{formatFCFA(Number(bien.base_rent_hc))}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Charges Fixes</span>
                <span className="text-xl font-black">{formatFCFA(Number(bien.base_charges))}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center text-indigo-200">
                <span className="text-[10px] font-bold uppercase tracking-widest">Dépôt de garantie</span>
                <span className="text-lg font-black">{formatFCFA(Number(bien.guarantee_deposit))}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isReserveModalOpen} onOpenChange={setIsReserveModalOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Demande de réservation</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Envoyez un message au propriétaire pour manifester votre intérêt pour ce bien.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                <Info className="h-5 w-5 text-indigo-500 mt-0.5" />
                <p className="text-xs text-indigo-700 leading-relaxed font-bold italic">
                  Une fois la demande envoyée, le propriétaire examinera votre profil et pourra vous contacter via la messagerie intégrée.
                </p>
             </div>
             <Textarea 
                placeholder="Ex: Bonjour, je suis intéressé par ce bien. J'aimerais le visiter dès que possible..." 
                className="rounded-2xl border-slate-200 focus:ring-indigo-500 min-h-[120px]"
                value={message}
                onChange={e => setMessage(e.target.value)}
             />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsReserveModalOpen(false)} className="rounded-xl font-bold border-slate-200">
              Annuler
            </Button>
            <Button 
                onClick={handleReserve}
                disabled={createMutation.isPending}
                className="rounded-xl font-black bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {createMutation.isPending ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
