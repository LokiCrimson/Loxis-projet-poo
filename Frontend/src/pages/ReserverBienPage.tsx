import React, { useState } from 'react';
import { 
  Building2, Search, Filter, MapPin, Maximize2, 
  DoorOpen, CheckCircle2, AlertCircle, Info, Send,
  ChevronLeft, ChevronRight, Bookmark, Calendar, Star, MessageSquare
} from 'lucide-react';
import { usePublicBiens, useCreateReservation, useReservations } from '@/hooks/use-reservations';
import { useCreateReview } from '@/hooks/use-reviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatFCFA } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const Carousel = ({ images }: { images: any[] }) => {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-slate-100 text-slate-400">
        <Building2 className="h-12 w-12" />
      </div>
    );
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative group aspect-video overflow-hidden rounded-t-xl">
      <img 
        src={images[index].image} 
        alt="Bien" 
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
      />
      {images.length > 1 && (
        <>
          <button 
            onClick={prev} 
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={next} 
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <div key={i} className={cn("h-1.5 w-1.5 rounded-full transition-all", i === index ? "bg-white w-3" : "bg-white/50")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function ReserverBienPage() {
  const { data: biens, isLoading } = usePublicBiens();
  const { data: myReservations } = useReservations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBien, setSelectedBien] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const createMutation = useCreateReservation();
  
  // Rating states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBien, setReviewBien] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const createReviewMutation = useCreateReview();

  const handleReserve = () => {
    if (selectedBien) {
      createMutation.mutate({ property: selectedBien.id, message }, {
        onSuccess: () => {
          setSelectedBien(null);
          setMessage('');
        }
      });
    }
  };

  const handleSendReview = () => {
    if (reviewBien) {
      createReviewMutation.mutate({ 
        propertyId: reviewBien.id, 
        rating, 
        comment 
      }, {
        onSuccess: () => {
          setShowReviewModal(false);
          setReviewBien(null);
          setRating(5);
          setComment('');
        }
      });
    }
  };

  const filterBiens = (biens || []).filter(b => 
    b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReservationStatus = (bienId: number) => {
    return myReservations?.find(r => r.property === bienId)?.status;
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Explorer les Biens</h1>
        <p className="text-muted-foreground font-medium">Réservez votre futur logement parmi nos offres disponibles.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Ville, code postal, adresse..." 
            className="pl-10 h-12 rounded-xl"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 rounded-xl gap-2 font-bold px-6 border-slate-200">
          <Filter className="h-4 w-4" />
          Filtres avancés
        </Button>
      </div>

      {filterBiens.length === 0 ? (
        <EmptyState 
          title="Aucun bien disponible" 
          description="Revenez plus tard, nous ajoutons de nouveaux biens régulièrement."
          icon={Building2}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filterBiens.map((bien) => {
            const status = getReservationStatus(bien.id);
            return (
              <Card key={bien.id} className="group border-none shadow-2xl shadow-slate-200/50 hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300 rounded-[2rem] overflow-hidden">
                <Carousel images={bien.photos || []} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px] rounded-lg border-none">
                      {bien.category_name} • {bien.property_type_name}
                    </Badge>
                    <span className="font-black text-indigo-600 text-lg">
                      {formatFCFA(bien.base_rent_hc)}
                      <span className="text-[10px] text-slate-400 font-medium lowercase"> /mois HC</span>
                    </span>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900 line-clamp-1">{bien.reference}</CardTitle>
                  <CardDescription className="flex items-center gap-1 font-medium italic">
                    <MapPin className="h-3.5 w-3.5" /> {bien.city}, {bien.zip_code}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <Maximize2 className="h-3 w-3" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Surface</span>
                      </div>
                      <p className="font-black text-slate-800 text-xs">{Math.round(bien.surface_area)}m²</p>
                    </div>
                    <div className="w-px bg-slate-200" />
                    <div className="flex-1 text-center">
                      <button 
                        onClick={(e) => { e.preventDefault(); setReviewBien(bien); setShowReviewModal(true); }}
                        className="w-full flex flex-col items-center justify-center"
                      >
                        <div className="flex items-center justify-center gap-1 text-slate-400 mb-1 hover:text-amber-500 transition-colors">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-[8px] font-black uppercase tracking-tighter">Note</span>
                        </div>
                        <p className="font-black text-slate-800 text-xs">{bien.average_rating || "0.0"}</p>
                      </button>
                    </div>
                    <div className="w-px bg-slate-200" />
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <DoorOpen className="h-3 w-3" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Pièces</span>
                      </div>
                      <p className="font-black text-slate-800 text-xs">{bien.rooms_count}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium italic">
                     {bien.description || "Aucune description fournie pour ce bien."}
                  </p>
                </CardContent>
                <CardFooter>
                  {status ? (
                    <div className={cn(
                      "w-full flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs uppercase tracking-widest",
                      status === 'PENDING' && "bg-amber-50 text-amber-600 border border-amber-100",
                      status === 'ACCEPTED' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                      status === 'REJECTED' && "bg-rose-50 text-rose-600 border border-rose-100",
                    )}>
                      {status === 'PENDING' ? <Calendar className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                      {status === 'PENDING' ? "Demande en attente" : status === 'ACCEPTED' ? "Réservation acceptée" : "Demande refusée"}
                    </div>
                  ) : (
                    <Button 
                      className="w-full rounded-2xl h-12 bg-slate-900 hover:bg-indigo-600 text-white font-black shadow-xl shadow-slate-200 transition-all gap-2"
                      onClick={() => setSelectedBien(bien)}
                    >
                      <Bookmark className="h-4 w-4" />
                      Réserver ce bien
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de réservation */}
      <Dialog open={!!selectedBien} onOpenChange={(open) => !open && setSelectedBien(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-md bg-white">
          <DialogHeader>
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Send className="h-6 w-6 text-indigo-600" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Confirmer la demande</DialogTitle>
            <DialogDescription className="font-bold text-slate-500 italic">
              Vous allez envoyer une demande de réservation pour le bien <strong>{selectedBien?.reference}</strong> ({selectedBien?.address}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message au propriétaire (facultatif)</label>
              <Textarea 
                placeholder="Ex: Je suis très intéressé par ce logement, mes garants sont prêts..." 
                className="rounded-2xl bg-slate-50 border-none min-h-[100px] focus:ring-2 focus:ring-indigo-600 font-medium"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>
            
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-[10px] font-bold text-amber-700 leading-tight italic">
                La réservation n'est pas contractuelle. Le propriétaire examinera votre dossier avant acceptation.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setSelectedBien(null)} className="rounded-xl font-bold">Annuler</Button>
            <Button 
              onClick={handleReserve} 
              disabled={createMutation.isPending}
              className="rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black px-8"
            >
              {createMutation.isPending ? "Envoi..." : "Envoyer ma demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour laisser un avis */}
      <Dialog open={showReviewModal} onOpenChange={(open) => !open && setShowReviewModal(false)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-md bg-white">
          <DialogHeader>
            <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-amber-600 fill-amber-600" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Noter ce bien</DialogTitle>
            <DialogDescription className="font-bold text-slate-500 italic">
              Partagez votre expérience sur le bien <strong>{reviewBien?.reference}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Votre note</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={cn(
                        "h-8 w-8 transition-colors",
                        star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Commentaire</label>
              <Textarea 
                placeholder="Qu'avez-vous pensé de la visite ou de l'emplacement ?" 
                className="rounded-2xl bg-slate-50 border-none min-h-[100px] focus:ring-2 focus:ring-amber-500 font-medium"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            </div>

            {/* Liste des avis existants */}
            {reviewBien?.reviews?.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Derniers avis</label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {reviewBien.reviews.map((r: any) => (
                    <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 italic text-[10px]">
                      <div className="flex justify-between mb-1">
                        <span className="font-black text-slate-700">{r.tenant_name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="h-2 w-2 text-amber-500 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setShowReviewModal(false)} className="rounded-xl font-bold">Annuler</Button>
            <Button 
              onClick={handleSendReview} 
              disabled={createReviewMutation.isPending}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black px-8"
            >
              {createReviewMutation.isPending ? "Envoi..." : "Publier l'avis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
